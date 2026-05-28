from datetime import time
from uuid import UUID

from app.schemas.common import ORMModel


class LampScheduleCreate(ORMModel):
    name: str
    is_active: bool = True
    auto_sunrise: bool = True
    auto_sunset: bool = True
    on_time: time | None = None
    off_time: time | None = None
    dimming_schedule: list[dict] = []


class LampScheduleUpdate(ORMModel):
    name: str | None = None
    is_active: bool | None = None
    auto_sunrise: bool | None = None
    auto_sunset: bool | None = None
    on_time: time | None = None
    off_time: time | None = None
    dimming_schedule: list[dict] | None = None


class LampScheduleRead(LampScheduleCreate):
    id: UUID
    lamp_id: UUID
