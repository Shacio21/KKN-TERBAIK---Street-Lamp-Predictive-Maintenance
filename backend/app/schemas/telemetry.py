from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel


class TelemetryCreate(ORMModel):
    lamp_code: str | None = None
    timestamp: datetime | None = None
    voltage: float | None = None
    current: float | None = None
    power: float | None = None
    energy: float | None = None
    solar_voltage: float | None = None
    solar_current: float | None = None
    solar_power: float | None = None
    solar_energy_today: float | None = None
    battery_level: float | None = None
    battery_voltage: float | None = None
    battery_current: float | None = None
    temperature_internal: float | None = None
    temperature_ambient: float | None = None
    lux: float | None = None
    motion_count: int = 0
    signal_strength: float | None = None
    mqtt_latency_ms: int | None = None
    brightness: float | None = None


class TelemetryRead(TelemetryCreate):
    id: int
    lamp_id: UUID
    time: datetime
    anomaly_score: float | None = None
