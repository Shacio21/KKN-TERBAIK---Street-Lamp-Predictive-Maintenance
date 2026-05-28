from datetime import datetime

from app.schemas.common import ORMModel
from app.schemas.telemetry import TelemetryCreate


class HeartbeatPayload(ORMModel):
    lamp_code: str
    timestamp: datetime | None = None
    uptime_seconds: int | None = None
    battery_level: float | None = None
    signal_strength: float | None = None


class DeviceLogPayload(ORMModel):
    lamp_code: str
    timestamp: datetime | None = None
    log_level: str
    event_code: str | None = None
    message: str | None = None


class OtaStatusPayload(ORMModel):
    lamp_code: str
    timestamp: datetime | None = None
    ota_job_id: str | None = None
    status: str
    new_firmware: str | None = None
    message: str | None = None


class TelemetryPayload(TelemetryCreate):
    pass
