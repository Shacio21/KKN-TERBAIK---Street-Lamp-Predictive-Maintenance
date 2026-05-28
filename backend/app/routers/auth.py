from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token, generate_opaque_token, hash_password, verify_password
from app.models import AuditLog, AuthToken, User
from app.schemas.auth import ForgotPasswordRequest, LoginRequest, RefreshRequest, RegisterRequest, ResetPasswordRequest, TokenResponse
from app.schemas.common import Message
from app.services.email_service import email_service

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Message)
@limiter.limit("5/hour")
async def register(request: Request, payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> Message:
    existing = await db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(409, "Email sudah terdaftar")
    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role="operator",
        status="pending",
    )
    db.add(user)
    await db.flush()
    token = AuthToken(
        user_id=user.id,
        token=generate_opaque_token(),
        token_type="email_verify",
        expires_at=datetime.now(UTC) + timedelta(hours=24),
    )
    db.add(token)
    await db.commit()
    # Send verification email
    settings = get_settings()
    await email_service.send_email(user.email, "verify_email", {
        "name": user.name,
        "verify_url": f"{settings.frontend_url}/verify-email?token={token.token}",
    })
    return Message(message="Registrasi berhasil. Verifikasi email lalu tunggu persetujuan admin.")


@router.get("/verify-email", response_model=Message)
async def verify_email(token: str, db: AsyncSession = Depends(get_db)) -> Message:
    auth_token = await db.scalar(
        select(AuthToken).where(
            AuthToken.token == token,
            AuthToken.token_type == "email_verify",
            AuthToken.is_revoked.is_(False),
            AuthToken.used_at.is_(None),
        )
    )
    if not auth_token or auth_token.expires_at < datetime.now(UTC):
        raise HTTPException(400, "Token verifikasi tidak valid")
    user = await db.get(User, auth_token.user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.email_verified = True
    user.email_verified_at = datetime.now(UTC)
    user.status = "awaiting_approval"
    auth_token.used_at = datetime.now(UTC)
    await db.commit()
    return Message(message="Email terverifikasi. Akun menunggu persetujuan admin.")


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await db.scalar(select(User).where(User.email == payload.email.lower(), User.is_deleted.is_(False)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Email atau password salah")
    if user.status != "active":
        raise HTTPException(403, "Akun belum aktif")
    settings = get_settings()
    refresh = AuthToken(
        user_id=user.id,
        token=generate_opaque_token(),
        token_type="refresh",
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
    )
    user.last_login_at = datetime.now(UTC)
    db.add(refresh)
    db.add(AuditLog(user_id=user.id, action="login", entity_type="user", entity_id=str(user.id), ip_address=request.client.host if request.client else None))
    await db.commit()
    response.set_cookie("refresh_token", refresh.token, httponly=True, samesite="lax")
    return TokenResponse(access_token=create_access_token(str(user.id), user.role))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response, payload: RefreshRequest | None = None, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    token_value = (payload.refresh_token if payload else None) or request.cookies.get("refresh_token")
    auth_token = await db.scalar(
        select(AuthToken).where(
            AuthToken.token == token_value,
            AuthToken.token_type == "refresh",
            AuthToken.is_revoked.is_(False),
            AuthToken.used_at.is_(None),
        )
    )
    if not auth_token or auth_token.expires_at < datetime.now(UTC):
        raise HTTPException(401, "Refresh token tidak valid")
    user = await db.get(User, auth_token.user_id)
    if not user or user.status != "active":
        raise HTTPException(401, "User tidak aktif")
    settings = get_settings()
    auth_token.used_at = datetime.now(UTC)
    new_refresh = AuthToken(
        user_id=user.id,
        token=generate_opaque_token(),
        token_type="refresh",
        expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(new_refresh)
    await db.commit()
    response.set_cookie("refresh_token", new_refresh.token, httponly=True, samesite="lax")
    return TokenResponse(access_token=create_access_token(str(user.id), user.role))


@router.post("/logout", response_model=Message)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)) -> Message:
    token_value = request.cookies.get("refresh_token")
    if token_value:
        auth_token = await db.scalar(select(AuthToken).where(AuthToken.token == token_value))
        if auth_token:
            auth_token.is_revoked = True
            await db.commit()
    response.delete_cookie("refresh_token")
    return Message(message="Logout berhasil")


@router.post("/resend-verification", response_model=Message)
async def resend_verification(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)) -> Message:
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if user:
        db.add(AuthToken(user_id=user.id, token=generate_opaque_token(), token_type="email_verify", expires_at=datetime.now(UTC) + timedelta(hours=24)))
        await db.commit()
    return Message(message="Jika email terdaftar, token verifikasi baru dibuat.")


@router.post("/forgot-password", response_model=Message)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)) -> Message:
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if user:
        token = AuthToken(user_id=user.id, token=generate_opaque_token(), token_type="password_reset", expires_at=datetime.now(UTC) + timedelta(hours=1))
        db.add(token)
        await db.commit()
        settings = get_settings()
        await email_service.send_email(user.email, "password_reset", {
            "name": user.name,
            "reset_url": f"{settings.frontend_url}/reset-password?token={token.token}",
        })
    return Message(message="Jika email terdaftar, instruksi reset password dikirim.")


@router.post("/reset-password", response_model=Message)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)) -> Message:
    auth_token = await db.scalar(select(AuthToken).where(AuthToken.token == payload.token, AuthToken.token_type == "password_reset", AuthToken.used_at.is_(None)))
    if not auth_token or auth_token.expires_at < datetime.now(UTC):
        raise HTTPException(400, "Token reset tidak valid")
    user = await db.get(User, auth_token.user_id)
    if not user:
        raise HTTPException(404, "User tidak ditemukan")
    user.password_hash = hash_password(payload.password)
    auth_token.used_at = datetime.now(UTC)
    await db.commit()
    return Message(message="Password berhasil diubah")

