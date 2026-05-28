"""Audit log router — queryable activity logs for admin dashboard."""

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models import AuditLog, User

router = APIRouter(prefix="/audit-logs", tags=["audit"])


@router.get("")
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action: str | None = None,
    user_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """List audit logs with optional filtering."""
    q = select(AuditLog)

    if action:
        q = q.where(AuditLog.action.ilike(f"%{action}%"))
    if user_id:
        q = q.where(AuditLog.user_id == user_id)

    # Count
    count_q = select(func.count()).select_from(q.subquery())
    total = await db.scalar(count_q) or 0

    # Fetch with user join
    rows = list(
        await db.scalars(
            q.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
        )
    )

    # Fetch user names for results
    user_ids = list({r.user_id for r in rows if r.user_id})
    user_map = {}
    if user_ids:
        users = list(await db.scalars(select(User).where(User.id.in_(user_ids))))
        user_map = {u.id: {"name": u.name, "email": u.email} for u in users}

    items = []
    for row in rows:
        items.append({
            "id": row.id,
            "user_id": str(row.user_id) if row.user_id else None,
            "user": user_map.get(row.user_id),
            "action": row.action,
            "resource_type": row.entity_type,
            "resource_id": row.entity_id,
            "details": str(row.detail) if row.detail else None,
            "ip_address": row.ip_address,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        })

    return {"items": items, "total": total}
