"""Reports router with actual report generation (CSV/Excel download)."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import ReportJob, User
from app.schemas.report import ReportCreate, ReportRead
from app.services.report_service import generate_report

router = APIRouter(prefix="/reports", tags=["reports"])

MIME_TYPES = {
    "csv": "text/csv",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "pdf": "application/pdf",
}


@router.get("/{report_type}")
async def download_report(
    report_type: str,
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query("csv", regex="^(csv|xlsx)$"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    """Generate and download a report directly."""
    if report_type not in ("lamp_status", "energy", "maintenance", "predictive"):
        raise HTTPException(400, "Jenis laporan tidak valid")
    if start_date > end_date:
        raise HTTPException(400, "Tanggal mulai harus sebelum tanggal akhir")

    try:
        buffer = await generate_report(db, report_type, start_date, end_date, format)
    except Exception as e:
        raise HTTPException(500, f"Gagal generate laporan: {str(e)}")

    # Record the report job
    job = ReportJob(
        report_type=report_type,
        requested_by=user.id,
        filters={"start_date": str(start_date), "end_date": str(end_date)},
        output_format=format,
        status="completed",
    )
    db.add(job)
    await db.commit()

    ext = format
    filename = f"laporan_{report_type}_{start_date}_{end_date}.{ext}"
    mime = MIME_TYPES.get(ext, "application/octet-stream")

    return StreamingResponse(
        buffer,
        media_type=mime,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/generate", response_model=ReportRead)
async def generate_report_job(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ReportJob:
    """Create a report generation job (for async/large reports)."""
    report = ReportJob(**payload.model_dump(), requested_by=user.id, status="pending")
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.get("/status/{job_id}", response_model=ReportRead)
async def report_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ReportJob:
    report = await db.get(ReportJob, job_id)
    if not report:
        raise HTTPException(404, "Report tidak ditemukan")
    return report


@router.get("/history/list", response_model=list[ReportRead])
async def report_history(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ReportJob]:
    return list(
        await db.scalars(
            select(ReportJob)
            .where(ReportJob.requested_by == user.id)
            .order_by(ReportJob.created_at.desc())
            .limit(100)
        )
    )
