from uuid import UUID

from app.schemas.common import ORMModel


class ReportCreate(ORMModel):
    report_type: str
    filters: dict | None = None
    output_format: str = "excel"


class ReportRead(ReportCreate):
    id: UUID
    status: str
    file_path: str | None = None
    error_message: str | None = None
