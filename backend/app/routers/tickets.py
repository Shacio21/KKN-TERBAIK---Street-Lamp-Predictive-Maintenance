from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.core.file_validation import validate_ticket_attachment
from app.models import RepairTicket, TicketAttachment, TicketLog, User
from app.schemas.common import Message
from app.schemas.ticket import TicketAttachmentRead, TicketCreate, TicketLogCreate, TicketRead, TicketStatusUpdate, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=list[TicketRead])
async def list_tickets(
    status: str | None = None,
    priority: str | None = None,
    lamp_id: UUID | None = None,
    limit: int = Query(50, le=200),
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[RepairTicket]:
    stmt = select(RepairTicket)
    if status:
        stmt = stmt.where(RepairTicket.status == status)
    if priority:
        stmt = stmt.where(RepairTicket.priority == priority)
    if lamp_id:
        stmt = stmt.where(RepairTicket.lamp_id == lamp_id)
    return list(await db.scalars(stmt.order_by(RepairTicket.created_at.desc()).limit(limit).offset(skip)))


@router.post("", response_model=TicketRead)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> RepairTicket:
    ticket = RepairTicket(**payload.model_dump(), created_by=user.id)
    db.add(ticket)
    await db.flush()
    db.add(TicketLog(ticket_id=ticket.id, user_id=user.id, action="ticket.create", note=payload.title))
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> RepairTicket:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    return ticket


@router.put("/{ticket_id}", response_model=TicketRead)
async def update_ticket(ticket_id: UUID, payload: TicketUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> RepairTicket:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, key, value)
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketRead)
async def update_ticket_status(ticket_id: UUID, payload: TicketStatusUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> RepairTicket:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    ticket.status = payload.status
    if payload.status == "in_progress" and ticket.started_at is None:
        ticket.started_at = datetime.now(UTC)
    if payload.status == "resolved":
        ticket.resolved_at = datetime.now(UTC)
        ticket.resolution_note = payload.resolution_note
    db.add(TicketLog(ticket_id=ticket.id, user_id=user.id, action=f"ticket.status.{payload.status}", note=payload.resolution_note))
    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.delete("/{ticket_id}", response_model=Message)
async def delete_ticket(ticket_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> Message:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    await db.delete(ticket)
    await db.commit()
    return Message(message="Tiket dihapus")


@router.post("/{ticket_id}/logs", response_model=Message)
async def add_ticket_log(ticket_id: UUID, payload: TicketLogCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> Message:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    db.add(TicketLog(ticket_id=ticket.id, user_id=user.id, action=payload.action, note=payload.note))
    await db.commit()
    return Message(message="Log tiket ditambahkan")


@router.get("/{ticket_id}/logs")
async def get_ticket_logs(ticket_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    logs = await db.scalars(
        select(TicketLog).where(TicketLog.ticket_id == ticket_id).order_by(TicketLog.created_at.desc())
    )
    result = []
    for log in logs:
        user_obj = await db.get(User, log.user_id) if log.user_id else None
        result.append({
            "id": log.id,
            "action": log.action,
            "note": log.note,
            "user_name": user_obj.name if user_obj else None,
            "created_at": log.created_at,
        })
    return result


@router.post("/{ticket_id}/attachments", response_model=TicketAttachmentRead)
async def upload_attachment(ticket_id: UUID, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)) -> TicketAttachment:
    ticket = await db.get(RepairTicket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Tiket tidak ditemukan")
    content = await validate_ticket_attachment(file)
    upload_dir = Path("uploads/tickets") / str(ticket_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4()}-{file.filename}"
    path = upload_dir / filename
    path.write_bytes(content)
    attachment = TicketAttachment(ticket_id=ticket.id, file_path=str(path), file_name=file.filename, mime_type=file.content_type, file_size=len(content), uploaded_by=user.id)
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


@router.get("/{ticket_id}/attachments", response_model=list[TicketAttachmentRead])
async def list_attachments(ticket_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[TicketAttachment]:
    return list(await db.scalars(select(TicketAttachment).where(TicketAttachment.ticket_id == ticket_id).order_by(TicketAttachment.created_at.desc())))


@router.delete("/{ticket_id}/attachments/{attachment_id}", response_model=Message)
async def delete_attachment(ticket_id: UUID, attachment_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Message:
    attachment = await db.get(TicketAttachment, attachment_id)
    if not attachment or attachment.ticket_id != ticket_id:
        raise HTTPException(404, "Lampiran tidak ditemukan")
    await db.delete(attachment)
    await db.commit()
    return Message(message="Lampiran dihapus")
