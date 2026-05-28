from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DeviceLog, Lamp, OtaJob, Telemetry
from app.schemas.iot import DeviceLogPayload, HeartbeatPayload, OtaStatusPayload
from app.schemas.telemetry import TelemetryCreate
from app.services.alert_service import create_alerts_for_thresholds
from app.services.anomaly_service import calculate_anomaly_score
from app.services.websocket_service import websocket_manager


async def get_lamp_by_code(db: AsyncSession, lamp_code: str) -> Lamp:
    lamp = await db.scalar(select(Lamp).where(Lamp.lamp_code == lamp_code, Lamp.is_deleted.is_(False)))
    if not lamp:
        raise HTTPException(404, "Lampu tidak ditemukan")
    return lamp


async def ingest_telemetry_payload(db: AsyncSession, payload: TelemetryCreate) -> Telemetry:
    if not payload.lamp_code:
        raise HTTPException(400, "lamp_code wajib diisi")
    lamp = await get_lamp_by_code(db, payload.lamp_code)
    data = payload.model_dump()
    timestamp = data.pop("timestamp") or datetime.now(UTC)
    data.pop("lamp_code", None)
    anomaly_score = calculate_anomaly_score(data)
    row = Telemetry(lamp_id=lamp.id, time=timestamp, anomaly_score=anomaly_score, raw_payload=payload.model_dump(mode="json"), **data)
    db.add(row)

    lamp.last_seen = timestamp
    lamp.status = "warning" if anomaly_score >= 0.7 else "online"
    if payload.battery_level is not None:
        lamp.last_battery_level = payload.battery_level
    if payload.brightness is not None:
        lamp.last_brightness = payload.brightness
    if payload.signal_strength is not None:
        lamp.last_signal_strength = payload.signal_strength
    lamp.telemetry_count = (lamp.telemetry_count or 0) + 1
    if lamp.telemetry_count >= 48:
        lamp.ml_ready = True

    await create_alerts_for_thresholds(db, lamp, payload.model_dump())
    await db.commit()
    await db.refresh(row)
    await websocket_manager.broadcast("dashboard", {"type": "telemetry", "lamp_id": str(lamp.id), "lamp_code": lamp.lamp_code})
    await websocket_manager.broadcast("map", {"type": "lamp_update", "lamp_id": str(lamp.id), "status": lamp.status})
    await websocket_manager.broadcast(f"lamp:{lamp.id}", {"type": "telemetry", "data": payload.model_dump(mode="json")})
    return row


async def ingest_heartbeat_payload(db: AsyncSession, payload: HeartbeatPayload) -> Lamp:
    lamp = await get_lamp_by_code(db, payload.lamp_code)
    timestamp = payload.timestamp or datetime.now(UTC)
    lamp.last_seen = timestamp
    lamp.status = "online"
    if payload.battery_level is not None:
        lamp.last_battery_level = payload.battery_level
    if payload.signal_strength is not None:
        lamp.last_signal_strength = payload.signal_strength
    await db.commit()
    await db.refresh(lamp)
    await websocket_manager.broadcast("map", {"type": "heartbeat", "lamp_id": str(lamp.id), "status": lamp.status})
    return lamp


async def ingest_device_log_payload(db: AsyncSession, payload: DeviceLogPayload) -> DeviceLog:
    lamp = await get_lamp_by_code(db, payload.lamp_code)
    row = DeviceLog(
        lamp_id=lamp.id,
        time=payload.timestamp or datetime.now(UTC),
        log_level=payload.log_level,
        event_code=payload.event_code,
        message=payload.message,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    await websocket_manager.broadcast(f"lamp:{lamp.id}", {"type": "device_log", "event_code": payload.event_code, "message": payload.message})
    return row


async def ingest_ota_status_payload(db: AsyncSession, payload: OtaStatusPayload) -> OtaJob:
    lamp = await get_lamp_by_code(db, payload.lamp_code)
    job: OtaJob | None = None
    if payload.ota_job_id:
        try:
            job = await db.get(OtaJob, UUID(payload.ota_job_id))
        except ValueError:
            job = None
    if not job:
        job = await db.scalar(select(OtaJob).where(OtaJob.lamp_id == lamp.id, OtaJob.status.in_(["sent", "downloading", "installing"])).order_by(OtaJob.created_at.desc()))
    if not job:
        raise HTTPException(404, "Job OTA aktif tidak ditemukan")

    normalized_status = "success" if payload.status == "success" else "failed" if payload.status == "failed" else payload.status
    job.status = normalized_status
    if normalized_status in {"success", "failed"}:
        job.completed_at = payload.timestamp or datetime.now(UTC)
    if normalized_status == "success" and payload.new_firmware:
        lamp.firmware_version = payload.new_firmware
    if normalized_status == "failed":
        job.error_message = payload.message
    await db.commit()
    await db.refresh(job)
    await websocket_manager.broadcast(f"lamp:{lamp.id}", {"type": "ota_status", "status": job.status, "message": payload.message})
    return job
