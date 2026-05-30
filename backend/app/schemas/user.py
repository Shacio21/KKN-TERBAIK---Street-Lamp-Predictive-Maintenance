from datetime import datetime
from uuid import UUID

from pydantic import EmailStr

from app.schemas.common import ORMModel


class UserRead(ORMModel):
    id: UUID
    email: EmailStr
    name: str
    role: str
    status: str
    avatar_url: str | None = None
    phone: str | None = None
    email_verified: bool
    created_at: datetime | None = None


class UserUpdate(ORMModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class ChangePasswordRequest(ORMModel):
    old_password: str
    new_password: str


class UserApprovalRequest(ORMModel):
    approved: bool
    reason: str | None = None


class UserRoleUpdate(ORMModel):
    role: str
