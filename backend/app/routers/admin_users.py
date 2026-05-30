from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models import AuditLog, User
from app.schemas.common import Message
from app.schemas.user import UserApprovalRequest, UserRead, UserRoleUpdate
from app.services.email_service import email_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[User]:
    return list(await db.scalars(select(User).where(User.is_deleted.is_(False)).order_by(User.created_at.desc())))


@router.get("/users/pending", response_model=list[UserRead])
async def pending_users(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[User]:
    return list(await db.scalars(select(User).where(User.status == "awaiting_approval", User.is_deleted.is_(False))))


@router.patch("/users/{user_id}/approval", response_model=UserRead)
async def approve_user(user_id: UUID, payload: UserApprovalRequest, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    if payload.approved:
        user.status = "active"
        user.approved_by = admin.id
        user.approved_at = datetime.now(UTC)
        action = "user.approve"
    else:
        user.status = "rejected"
        user.rejected_by = admin.id
        user.rejected_at = datetime.now(UTC)
        user.rejection_reason = payload.reason
        action = "user.reject"
    db.add(AuditLog(user_id=admin.id, action=action, entity_type="user", entity_id=str(user.id), detail=payload.model_dump()))
    await db.commit()
    await db.refresh(user)
    # Send email notification
    settings = get_settings()
    if payload.approved:
        await email_service.send_email(user.email, "account_approved", {
            "name": user.name,
            "login_url": f"{settings.frontend_url}/login",
        })
    else:
        await email_service.send_email(user.email, "account_rejected", {
            "name": user.name,
            "reason": payload.reason or "Tidak ada alasan yang diberikan.",
        })
    return user


@router.patch("/users/{user_id}/role", response_model=UserRead)
async def update_role(user_id: UUID, payload: UserRoleUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> User:
    if payload.role not in {"admin", "operator"}:
        raise HTTPException(400, "Role tidak valid")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.role = payload.role
    db.add(AuditLog(user_id=admin.id, action="user.role_update", entity_type="user", entity_id=str(user.id), detail=payload.model_dump()))
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}/suspend", response_model=Message)
async def suspend_user(user_id: UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> Message:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.status = "suspended"
    db.add(AuditLog(user_id=admin.id, action="user.suspend", entity_type="user", entity_id=str(user.id)))
    await db.commit()
    await email_service.send_email(user.email, "account_suspended", {"name": user.name})
    return Message(message="User disuspend")


@router.patch("/users/{user_id}/activate", response_model=Message)
async def activate_user(user_id: UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> Message:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.status = "active"
    db.add(AuditLog(user_id=admin.id, action="user.activate", entity_type="user", entity_id=str(user.id)))
    await db.commit()
    settings = get_settings()
    await email_service.send_email(user.email, "account_approved", {
        "name": user.name,
        "login_url": f"{settings.frontend_url}/login",
    })
    return Message(message="User diaktifkan kembali")


@router.delete("/users/{user_id}", response_model=Message)
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)) -> Message:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.is_deleted = True
    db.add(AuditLog(user_id=admin.id, action="user.delete", entity_type="user", entity_id=str(user.id)))
    await db.commit()
    return Message(message="User dihapus")


@router.get("/audit-logs")
async def audit_logs(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = await db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(200))
    return [{"id": row.id, "action": row.action, "entity_type": row.entity_type, "entity_id": row.entity_id, "created_at": row.created_at} for row in rows]
