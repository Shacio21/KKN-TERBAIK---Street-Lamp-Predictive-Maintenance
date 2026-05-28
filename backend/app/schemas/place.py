from uuid import UUID

from app.schemas.common import ORMModel, Timestamped


class PlaceBase(ORMModel):
    name: str
    type: str | None = None
    parent_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None


class PlaceCreate(PlaceBase):
    pass


class PlaceUpdate(ORMModel):
    name: str | None = None
    type: str | None = None
    parent_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None


class PlaceRead(PlaceBase, Timestamped):
    id: UUID
