from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel


class DeviceLogRead(ORMModel):
    id: int
    lamp_id: UUID
    time: datetime
    log_level: str
    event_code: str | None = None
    message: str | None = None
