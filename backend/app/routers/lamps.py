from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.core.validators import validate_indonesia_coordinates
from app.models import Alert, AuditLog, DeviceLog, Lamp, LampSchedule, OtaJob, Prediction, RepairTicket, Telemetry, User
from app.schemas.alert import AlertRead
from app.schemas.common import Message
from app.schemas.device_log import DeviceLogRead
from app.schemas.lamp import BrightnessUpdate, LampCreate, LampRead, LampStatusUpdate, LampUpdate
from app.schemas.lamp_schedule import LampScheduleCreate, LampScheduleRead, LampScheduleUpdate
from app.schemas.ota import OtaCreate, OtaRead
from app.schemas.telemetry import TelemetryRead
from app.schemas.ticket import TicketRead
from app.services.mqtt_service import mqtt_service

router = APIRouter(prefix="/lamps", tags=["lamps"])


async def _get_lamp_or_404(db: AsyncSession, lamp_id: UUID) -> Lamp:
    lamp = await db.get(Lamp, lamp_id)
    if not lamp or lamp.is_deleted:
        raise HTTPException(404, "Lampu tidak ditemukan")
    return lamp


@router.get("", response_model=list[LampRead])
async def list_lamps(
    status: str | None = None,
    place_id: UUID | None = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Lamp]:
    stmt = select(Lamp).where(Lamp.is_deleted.is_(False))
    if status:
        stmt = stmt.where(Lamp.status == status)
    if place_id:
        stmt = stmt.where(Lamp.place_id == place_id)
    return list(await db.scalars(stmt.order_by(Lamp.lamp_code).limit(limit).offset(offset)))


@router.post("", response_model=LampRead)
async def create_lamp(payload: LampCreate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> Lamp:
    validate_indonesia_coordinates(payload.latitude, payload.longitude)
    lamp = Lamp(**payload.model_dump(), created_by=user.id, status="offline", risk_level="unknown")
    db.add(lamp)
    await db.commit()
    await db.refresh(lamp)
    return lamp


@router.get("/{lamp_id}", response_model=LampRead)
async def get_lamp(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Lamp:
    return await _get_lamp_or_404(db, lamp_id)


@router.put("/{lamp_id}", response_model=LampRead)
async def update_lamp(lamp_id: UUID, payload: LampUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> Lamp:
    lamp = await _get_lamp_or_404(db, lamp_id)
    values = payload.model_dump(exclude_unset=True)
    validate_indonesia_coordinates(values.get("latitude", lamp.latitude), values.get("longitude", lamp.longitude))
    for key, value in values.items():
        setattr(lamp, key, value)
    await db.commit()
    await db.refresh(lamp)
    return lamp


@router.delete("/{lamp_id}", response_model=Message)
async def delete_lamp(lamp_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> Message:
    lamp = await _get_lamp_or_404(db, lamp_id)
    lamp.is_deleted = True
    db.add(AuditLog(user_id=user.id, action="lamp.delete", entity_type="lamp", entity_id=str(lamp.id)))
    await db.commit()
    return Message(message="Lampu dihapus")


@router.patch("/{lamp_id}/status", response_model=LampRead)
async def update_status(lamp_id: UUID, payload: LampStatusUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Lamp:
    if payload.status not in {"online", "warning", "fault", "maintenance", "offline"}:
        raise HTTPException(400, "Status lampu tidak valid")
    lamp = await _get_lamp_or_404(db, lamp_id)
    lamp.status = payload.status
    await db.commit()
    await db.refresh(lamp)
    return lamp


@router.patch("/{lamp_id}/brightness")
async def set_brightness(lamp_id: UUID, payload: BrightnessUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    if not 0 <= payload.brightness <= 100:
        raise HTTPException(400, "Brightness harus 0-100")
    lamp = await _get_lamp_or_404(db, lamp_id)
    lamp.last_brightness = payload.brightness
    result = await mqtt_service.publish_brightness(str(lamp.place_id) if lamp.place_id else None, lamp.lamp_code, payload.brightness, user.email)
    db.add(AuditLog(user_id=user.id, action="lamp.brightness_set", entity_type="lamp", entity_id=str(lamp.id), detail=result))
    await db.commit()
    return result


@router.get("/{lamp_id}/telemetry", response_model=list[TelemetryRead])
async def lamp_telemetry(lamp_id: UUID, start: datetime | None = None, end: datetime | None = None, limit: int = Query(200, le=1000), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Telemetry]:
    stmt = select(Telemetry).where(Telemetry.lamp_id == lamp_id)
    if start:
        stmt = stmt.where(Telemetry.time >= start)
    if end:
        stmt = stmt.where(Telemetry.time <= end)
    return list(await db.scalars(stmt.order_by(Telemetry.time.desc()).limit(limit)))


@router.get("/{lamp_id}/predictions")
async def lamp_predictions(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    rows = await db.scalars(select(Prediction).where(Prediction.lamp_id == lamp_id).order_by(Prediction.predicted_at.desc()).limit(20))
    return [{"id": row.id, "risk_level": row.risk_level, "failure_probability": row.failure_probability, "days_to_failure": row.days_to_failure} for row in rows]


@router.get("/{lamp_id}/alerts", response_model=list[AlertRead])
async def lamp_alerts(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Alert]:
    return list(await db.scalars(select(Alert).where(Alert.lamp_id == lamp_id).order_by(Alert.created_at.desc()).limit(100)))


@router.get("/{lamp_id}/tickets", response_model=list[TicketRead])
async def lamp_tickets(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[RepairTicket]:
    return list(await db.scalars(select(RepairTicket).where(RepairTicket.lamp_id == lamp_id).order_by(RepairTicket.created_at.desc())))


@router.get("/{lamp_id}/device-logs", response_model=list[DeviceLogRead])
async def lamp_device_logs(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[DeviceLog]:
    return list(await db.scalars(select(DeviceLog).where(DeviceLog.lamp_id == lamp_id).order_by(DeviceLog.time.desc()).limit(100)))


@router.get("/{lamp_id}/schedule", response_model=list[LampScheduleRead])
async def get_schedule(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[LampSchedule]:
    return list(await db.scalars(select(LampSchedule).where(LampSchedule.lamp_id == lamp_id)))


@router.post("/{lamp_id}/schedule", response_model=LampScheduleRead)
async def create_schedule(lamp_id: UUID, payload: LampScheduleCreate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> LampSchedule:
    lamp = await _get_lamp_or_404(db, lamp_id)
    schedule = LampSchedule(lamp_id=lamp.id, created_by=user.id, **payload.model_dump())
    db.add(schedule)
    await db.flush()
    await mqtt_service.publish_schedule(str(lamp.place_id) if lamp.place_id else None, lamp.lamp_code, payload.model_dump(mode="json"))
    db.add(AuditLog(user_id=user.id, action="lamp.schedule_set", entity_type="lamp", entity_id=str(lamp.id)))
    await db.commit()
    await db.refresh(schedule)
    return schedule


@router.put("/{lamp_id}/schedule/{schedule_id}", response_model=LampScheduleRead)
async def update_schedule(lamp_id: UUID, schedule_id: UUID, payload: LampScheduleUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> LampSchedule:
    lamp = await _get_lamp_or_404(db, lamp_id)
    schedule = await db.get(LampSchedule, schedule_id)
    if not schedule or schedule.lamp_id != lamp.id:
        raise HTTPException(404, "Jadwal tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(schedule, key, value)
    await mqtt_service.publish_schedule(str(lamp.place_id) if lamp.place_id else None, lamp.lamp_code, payload.model_dump(exclude_unset=True, mode="json"))
    db.add(AuditLog(user_id=user.id, action="lamp.schedule_set", entity_type="lamp", entity_id=str(lamp.id)))
    await db.commit()
    await db.refresh(schedule)
    return schedule


@router.get("/{lamp_id}/ota", response_model=list[OtaRead])
async def list_ota(lamp_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[OtaJob]:
    return list(await db.scalars(select(OtaJob).where(OtaJob.lamp_id == lamp_id).order_by(OtaJob.created_at.desc())))


@router.post("/{lamp_id}/ota", response_model=OtaRead)
async def trigger_ota(lamp_id: UUID, payload: OtaCreate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> OtaJob:
    lamp = await _get_lamp_or_404(db, lamp_id)
    job = OtaJob(lamp_id=lamp.id, firmware_version=payload.firmware_version, firmware_url=payload.firmware_url, status="sent", triggered_by=user.id, started_at=datetime.now(UTC))
    db.add(job)
    await db.flush()
    await mqtt_service.publish_ota(str(lamp.place_id) if lamp.place_id else None, lamp.lamp_code, {"ota_job_id": str(job.id), **payload.model_dump()})
    db.add(AuditLog(user_id=user.id, action="lamp.ota_trigger", entity_type="lamp", entity_id=str(lamp.id)))
    await db.commit()
    await db.refresh(job)
    return job
