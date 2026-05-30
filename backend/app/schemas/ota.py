from uuid import UUID

from app.schemas.common import ORMModel


class OtaCreate(ORMModel):
    firmware_version: str
    firmware_url: str


class OtaRead(OtaCreate):
    id: UUID
    lamp_id: UUID
    status: str
    error_message: str | None = None
