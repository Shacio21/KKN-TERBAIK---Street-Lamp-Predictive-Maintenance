"""User profile endpoints: view, update, change password, upload avatar."""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password
from app.models import User
from app.schemas.common import Message
from app.schemas.user import ChangePasswordRequest, UserRead, UserUpdate

router = APIRouter(prefix="/users/me", tags=["users"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.put("", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.patch("", response_model=UserRead)
async def patch_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password", response_model=Message)
@router.patch("/password", response_model=Message)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Message:
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(400, "Password lama salah")
    current_user.password_hash = hash_password(payload.new_password)
    await db.commit()
    return Message(message="Password berhasil diubah")


@router.post("/avatar", response_model=UserRead)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Upload user avatar with validation and resize."""
    # Validate content type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Hanya file JPEG, PNG, atau WebP yang diizinkan")

    # Read file content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Ukuran file maksimal 5MB")

    # Validate it's actually an image using magic bytes
    try:
        import magic
        mime = magic.from_buffer(content, mime=True)
        if mime not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(400, "File bukan gambar valid")
    except ImportError:
        pass  # Skip magic validation if not installed

    # Resize with Pillow
    try:
        from PIL import Image
        import io

        img = Image.open(io.BytesIO(content))
        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Resize to 256x256 with crop to center
        img.thumbnail((256, 256), Image.Resampling.LANCZOS)
        # Save to buffer
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85, optimize=True)
        content = buffer.getvalue()
    except Exception:
        pass  # If Pillow fails, use original content

    # Save file
    settings = get_settings()
    upload_dir = Path(settings.upload_dir) / "avatars"
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.jpg"
    filepath = upload_dir / filename

    filepath.write_bytes(content)

    # Update user record
    current_user.avatar_url = f"/uploads/avatars/{filename}"
    await db.commit()
    await db.refresh(current_user)
    return current_user
