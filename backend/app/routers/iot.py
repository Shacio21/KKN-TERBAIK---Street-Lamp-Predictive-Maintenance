from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import DeviceLog, Lamp, OtaJob, Telemetry
from app.schemas.device_log import DeviceLogRead
from app.schemas.iot import DeviceLogPayload, HeartbeatPayload, OtaStatusPayload, TelemetryPayload
from app.schemas.lamp import LampRead
from app.schemas.ota import OtaRead
from app.schemas.telemetry import TelemetryRead
from app.services.iot_ingestion_service import ingest_device_log_payload, ingest_heartbeat_payload, ingest_ota_status_payload, ingest_telemetry_payload

router = APIRouter(prefix="/iot", tags=["iot"])


@router.post("/telemetry", response_model=TelemetryRead)
async def telemetry(payload: TelemetryPayload, db: AsyncSession = Depends(get_db)) -> Telemetry:
    return await ingest_telemetry_payload(db, payload)


@router.post("/heartbeat", response_model=LampRead)
async def heartbeat(payload: HeartbeatPayload, db: AsyncSession = Depends(get_db)) -> Lamp:
    return await ingest_heartbeat_payload(db, payload)


@router.post("/device-log", response_model=DeviceLogRead)
async def device_log(payload: DeviceLogPayload, db: AsyncSession = Depends(get_db)) -> DeviceLog:
    return await ingest_device_log_payload(db, payload)


@router.post("/ota-status", response_model=OtaRead)
async def ota_status(payload: OtaStatusPayload, db: AsyncSession = Depends(get_db)) -> OtaJob:
    return await ingest_ota_status_payload(db, payload)
