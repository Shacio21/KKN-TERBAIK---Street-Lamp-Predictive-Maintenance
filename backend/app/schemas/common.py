from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Message(ORMModel):
    message: str


class IdResponse(ORMModel):
    id: UUID


class Timestamped(ORMModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None
