from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Alert, AlertThreshold, Lamp


async def create_alerts_for_thresholds(db: AsyncSession, lamp: Lamp, payload: dict) -> list[Alert]:
    thresholds = await db.scalars(select(AlertThreshold).where(AlertThreshold.is_active.is_(True)))
    created: list[Alert] = []
    for threshold in thresholds:
        value = payload.get(threshold.metric)
        if value is None:
            continue
        metric_value = float(value)
        warning = float(threshold.warning_value) if threshold.warning_value is not None else None
        critical = float(threshold.critical_value) if threshold.critical_value is not None else None
        severity = None
        if threshold.condition == "lt":
            if critical is not None and metric_value <= critical:
                severity = "critical"
            elif warning is not None and metric_value <= warning:
                severity = "warning"
        elif threshold.condition == "gt":
            if critical is not None and metric_value >= critical:
                severity = "critical"
            elif warning is not None and metric_value >= warning:
                severity = "warning"
        if not severity:
            continue

        alert = Alert(
            lamp_id=lamp.id,
            threshold_id=threshold.id,
            alert_type=threshold.metric,
            severity=severity,
            message=f"{threshold.name}: {metric_value}",
            metric_value=metric_value,
        )
        db.add(alert)
        created.append(alert)
    return created
