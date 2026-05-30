import csv
import io
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Alert, Lamp, Telemetry, User
from app.schemas.telemetry import TelemetryCreate, TelemetryRead
from app.services.iot_ingestion_service import ingest_telemetry_payload

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/kpi")
async def kpi(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    """Dashboard KPI - returns all fields needed by DashboardHome."""
    total_lamps = await db.scalar(
        select(func.count()).select_from(Lamp).where(Lamp.is_deleted.is_(False))
    ) or 0

    online = await db.scalar(
        select(func.count()).select_from(Lamp).where(
            Lamp.status == "online", Lamp.is_deleted.is_(False)
        )
    ) or 0

    offline = await db.scalar(
        select(func.count()).select_from(Lamp).where(
            Lamp.status == "offline", Lamp.is_deleted.is_(False)
        )
    ) or 0

    fault = await db.scalar(
        select(func.count()).select_from(Lamp).where(
            Lamp.status == "fault", Lamp.is_deleted.is_(False)
        )
    ) or 0

    warning = await db.scalar(
        select(func.count()).select_from(Lamp).where(
            Lamp.status == "warning", Lamp.is_deleted.is_(False)
        )
    ) or 0

    maintenance = await db.scalar(
        select(func.count()).select_from(Lamp).where(
            Lamp.status == "maintenance", Lamp.is_deleted.is_(False)
        )
    ) or 0

    # Alerts today
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    alerts_today = await db.scalar(
        select(func.count()).select_from(Alert).where(
            Alert.created_at >= today_start
        )
    ) or 0

    unresolved_alerts = await db.scalar(
        select(func.count()).select_from(Alert).where(Alert.is_resolved.is_(False))
    ) or 0

    # Averages
    avg_battery = await db.scalar(
        select(func.avg(Lamp.last_battery_level)).where(Lamp.is_deleted.is_(False))
    )
    avg_health = await db.scalar(
        select(func.avg(Lamp.health_score)).where(Lamp.is_deleted.is_(False))
    )

    # Solar status (simplified: if any lamp has solar_power > 0 recently, it's "Charging")
    recent_solar = await db.scalar(
        select(func.count()).select_from(Telemetry).where(
            Telemetry.time >= datetime.now(UTC) - timedelta(hours=1),
            Telemetry.solar_power > 0,
        )
    )
    solar_status = "Charging" if (recent_solar and recent_solar > 0) else "Idle"

    return {
        "total_lamps": total_lamps,
        "online": online,
        "online_lamps": online,
        "offline": offline,
        "offline_lamps": offline,
        "fault": fault,
        "warning": warning,
        "maintenance": maintenance,
        "alerts_today": alerts_today,
        "unresolved_alerts": unresolved_alerts,
        "avg_battery": float(avg_battery) if avg_battery else 0,
        "avg_battery_level": float(avg_battery) if avg_battery else 0,
        "avg_health_score": float(avg_health) if avg_health else 0,
        "solar_status": solar_status,
    }


@router.get("/risk-summary")
async def risk_summary(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    rows = await db.execute(
        select(Lamp.risk_level, func.count()).where(
            Lamp.is_deleted.is_(False)
        ).group_by(Lamp.risk_level)
    )
    return {risk or "unknown": count for risk, count in rows.all()}


@router.get("/trend")
async def trend(
    lamp_id: str | None = None,
    limit: int = Query(100, le=500),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    stmt = select(Telemetry)
    if lamp_id:
        from uuid import UUID
        stmt = stmt.where(Telemetry.lamp_id == UUID(lamp_id))
    rows = await db.scalars(stmt.order_by(Telemetry.time.desc()).limit(limit))
    return [
        {
            "time": row.time,
            "power": float(row.power) if row.power else None,
            "solar_power": float(row.solar_power) if row.solar_power else None,
            "battery_level": float(row.battery_level) if row.battery_level else None,
            "voltage": float(row.voltage) if row.voltage else None,
            "current": float(row.current) if row.current else None,
            "temperature_internal": float(row.temperature_internal) if row.temperature_internal else None,
            "lux": float(row.lux) if row.lux else None,
            "anomaly_score": float(row.anomaly_score) if row.anomaly_score else None,
        }
        for row in rows
    ]


@router.get("/telemetry", response_model=list[TelemetryRead])
async def telemetry(
    lamp_id: str | None = None,
    limit: int = Query(200, le=1000),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Telemetry]:
    stmt = select(Telemetry)
    if lamp_id:
        from uuid import UUID
        stmt = stmt.where(Telemetry.lamp_id == UUID(lamp_id))
    return list(await db.scalars(stmt.order_by(Telemetry.time.desc()).limit(limit)))


@router.post("/telemetry", response_model=TelemetryRead)
async def ingest_telemetry(payload: TelemetryCreate, db: AsyncSession = Depends(get_db)) -> Telemetry:
    return await ingest_telemetry_payload(db, payload)


@router.get("/telemetry/export")
async def export_telemetry(
    lamp_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> StreamingResponse:
    stmt = select(Telemetry)
    if lamp_id:
        from uuid import UUID
        stmt = stmt.where(Telemetry.lamp_id == UUID(lamp_id))
    rows = await db.scalars(stmt.order_by(Telemetry.time.desc()).limit(5000))
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow([
        "id", "lamp_id", "time", "voltage", "current", "power",
        "battery_level", "solar_power", "temperature_internal",
        "lux", "signal_strength", "anomaly_score",
    ])
    for row in rows:
        writer.writerow([
            row.id, row.lamp_id, row.time, row.voltage, row.current,
            row.power, row.battery_level, row.solar_power,
            row.temperature_internal, row.lux, row.signal_strength,
            row.anomaly_score,
        ])
    stream.seek(0)
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=telemetry.csv"},
    )
