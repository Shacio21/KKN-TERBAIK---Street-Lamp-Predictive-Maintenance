from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.core.validators import validate_indonesia_coordinates
from app.models import Lamp, Place, User
from app.schemas.common import Message
from app.schemas.lamp import LampRead
from app.schemas.place import PlaceCreate, PlaceRead, PlaceUpdate

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[PlaceRead])
async def list_places(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Place]:
    return list(await db.scalars(select(Place).where(Place.is_deleted.is_(False)).order_by(Place.name)))


@router.post("", response_model=PlaceRead)
async def create_place(payload: PlaceCreate, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> Place:
    validate_indonesia_coordinates(payload.latitude, payload.longitude)
    place = Place(**payload.model_dump(), created_by=user.id)
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return place


@router.get("/{place_id}", response_model=PlaceRead)
async def get_place(place_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Place:
    place = await db.get(Place, place_id)
    if not place or place.is_deleted:
        raise HTTPException(404, "Tempat tidak ditemukan")
    return place


@router.put("/{place_id}", response_model=PlaceRead)
async def update_place(place_id: UUID, payload: PlaceUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> Place:
    place = await db.get(Place, place_id)
    if not place or place.is_deleted:
        raise HTTPException(404, "Tempat tidak ditemukan")
    values = payload.model_dump(exclude_unset=True)
    validate_indonesia_coordinates(values.get("latitude", place.latitude), values.get("longitude", place.longitude))
    for key, value in values.items():
        setattr(place, key, value)
    await db.commit()
    await db.refresh(place)
    return place


@router.delete("/{place_id}", response_model=Message)
async def delete_place(place_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> Message:
    place = await db.get(Place, place_id)
    if not place:
        raise HTTPException(404, "Tempat tidak ditemukan")
    place.is_deleted = True
    await db.commit()
    return Message(message="Tempat dihapus")


@router.get("/{place_id}/lamps", response_model=list[LampRead])
async def place_lamps(place_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[Lamp]:
    return list(await db.scalars(select(Lamp).where(Lamp.place_id == place_id, Lamp.is_deleted.is_(False)).order_by(Lamp.lamp_code)))
