from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Notification, User
from app.schemas.common import Message

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> list[dict]:
    rows = await db.scalars(select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(100))
    return [{"id": row.id, "title": row.title, "message": row.message, "type": row.type, "is_read": row.is_read, "created_at": row.created_at} for row in rows]


@router.patch("/read-all", response_model=Message)
async def read_all(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> Message:
    rows = await db.scalars(select(Notification).where(Notification.user_id == user.id, Notification.is_read.is_(False)))
    for row in rows:
        row.is_read = True
        row.read_at = datetime.now(UTC)
    await db.commit()
    return Message(message="Semua notifikasi ditandai dibaca")


@router.patch("/{notification_id}/read", response_model=Message)
async def read_notification(notification_id: UUID, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> Message:
    notification = await db.get(Notification, notification_id)
    if not notification or notification.user_id != user.id:
        raise HTTPException(404, "Notifikasi tidak ditemukan")
    notification.is_read = True
    notification.read_at = datetime.now(UTC)
    await db.commit()
    return Message(message="Notifikasi ditandai dibaca")
