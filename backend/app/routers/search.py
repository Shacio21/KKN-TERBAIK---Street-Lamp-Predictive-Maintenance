from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Lamp, Place, RepairTicket, User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def search(q: str = Query(min_length=2), limit: int = Query(10, le=50), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    term = f"%{q}%"
    lamps = await db.scalars(select(Lamp).where(Lamp.lamp_code.ilike(term), Lamp.is_deleted.is_(False)).limit(limit))
    places = await db.scalars(select(Place).where(Place.name.ilike(term), Place.is_deleted.is_(False)).limit(limit))
    tickets = await db.scalars(select(RepairTicket).where(or_(RepairTicket.title.ilike(term), RepairTicket.description.ilike(term))).limit(limit))
    return {
        "lamps": [{"id": row.id, "lamp_code": row.lamp_code, "status": row.status} for row in lamps],
        "places": [{"id": row.id, "name": row.name, "type": row.type} for row in places],
        "tickets": [{"id": row.id, "title": row.title, "status": row.status} for row in tickets],
    }
