from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel, Timestamped


class LampBase(ORMModel):
    lamp_code: str
    place_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    model: str | None = None
    power_rating: float | None = None
    panel_watt_peak: float | None = None
    battery_capacity_wh: float | None = None
    firmware_version: str | None = None
    installed_at: datetime | None = None


class LampCreate(LampBase):
    pass


class LampUpdate(ORMModel):
    lamp_code: str | None = None
    place_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    model: str | None = None
    power_rating: float | None = None
    panel_watt_peak: float | None = None
    battery_capacity_wh: float | None = None
    firmware_version: str | None = None
    installed_at: datetime | None = None


class LampStatusUpdate(ORMModel):
    status: str


class BrightnessUpdate(ORMModel):
    brightness: float


class LampRead(LampBase, Timestamped):
    id: UUID
    status: str
    health_score: float | None = None
    risk_level: str | None = None
    last_seen: datetime | None = None
    last_battery_level: float | None = None
    last_brightness: float | None = None
    last_signal_strength: float | None = None
    telemetry_count: int
    ml_ready: bool
