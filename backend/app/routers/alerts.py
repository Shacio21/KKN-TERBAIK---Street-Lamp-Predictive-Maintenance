from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Alert, User
from app.schemas.alert import AlertRead, ResolveAlertRequest

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertRead])
async def list_alerts(
    is_resolved: bool | None = None,
    unresolved: bool = False,
    severity: str | None = None,
    limit: int = Query(200, le=500),
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Alert]:
    stmt = select(Alert)
    # Frontend sends ?is_resolved=false, backend also supports ?unresolved=true
    if is_resolved is not None:
        stmt = stmt.where(Alert.is_resolved.is_(is_resolved))
    elif unresolved:
        stmt = stmt.where(Alert.is_resolved.is_(False))
    if severity:
        stmt = stmt.where(Alert.severity == severity)
    return list(await db.scalars(stmt.order_by(Alert.created_at.desc()).limit(limit).offset(skip)))


@router.get("/{alert_id}", response_model=AlertRead)
async def get_alert(alert_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Alert:
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert tidak ditemukan")
    return alert


@router.patch("/{alert_id}/resolve", response_model=AlertRead)
async def resolve_alert(alert_id: UUID, payload: ResolveAlertRequest, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> Alert:
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert tidak ditemukan")
    alert.is_resolved = True
    alert.resolved_by = user.id
    alert.resolved_at = datetime.now(UTC)
    alert.resolve_note = payload.note
    await db.commit()
    await db.refresh(alert)
    return alert
