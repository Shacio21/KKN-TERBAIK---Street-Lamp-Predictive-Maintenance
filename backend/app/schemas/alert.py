from datetime import datetime
from uuid import UUID

from app.schemas.common import ORMModel


class AlertRead(ORMModel):
    id: UUID
    lamp_id: UUID | None = None
    alert_type: str | None = None
    severity: str | None = None
    message: str | None = None
    metric_value: float | None = None
    is_resolved: bool
    created_at: datetime


class ResolveAlertRequest(ORMModel):
    note: str | None = None
