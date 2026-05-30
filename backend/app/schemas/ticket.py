from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel


class TicketCreate(ORMModel):
    lamp_id: UUID
    alert_id: UUID | None = None
    title: str
    description: str | None = None
    priority: str = "medium"
    assigned_to: UUID | None = None


class TicketUpdate(ORMModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    assigned_to: UUID | None = None


class TicketStatusUpdate(ORMModel):
    status: str
    resolution_note: str | None = None


class TicketRead(TicketCreate):
    id: UUID
    status: str
    created_by: UUID | None = None
    created_at: datetime
    updated_at: datetime


class TicketLogCreate(ORMModel):
    action: str
    note: str | None = None


class TicketAttachmentRead(ORMModel):
    id: UUID
    ticket_id: UUID
    file_path: str
    file_name: str | None = None
    mime_type: str | None = None
    file_size: int | None = None
    created_at: datetime
