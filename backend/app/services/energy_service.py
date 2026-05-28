from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import EnergyCostConfig, Lamp, Telemetry


async def get_energy_summary(db: AsyncSession) -> dict:
    lamp_count = await db.scalar(
        select(func.count()).select_from(Lamp).where(Lamp.is_deleted.is_(False))
    ) or 0

    # Overall totals
    totals = await db.execute(
        select(
            func.coalesce(func.sum(Telemetry.solar_energy_today), 0),
            func.coalesce(func.sum(Telemetry.energy), 0),
        )
    )
    solar_wh, consumed_kwh = totals.one()
    solar_kwh = float(solar_wh or 0) / 1000
    consumed_kwh = float(consumed_kwh or 0)

    # Today's summary
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    today_totals = await db.execute(
        select(
            func.coalesce(func.sum(Telemetry.solar_energy_today), 0),
            func.coalesce(func.sum(Telemetry.energy), 0),
        ).where(Telemetry.time >= today_start)
    )
    solar_today_wh, consumed_today_kwh = today_totals.one()
    solar_today_kwh = float(solar_today_wh or 0) / 1000
    consumed_today_kwh = float(consumed_today_kwh or 0)

    efficiency_pct = round((solar_today_kwh / consumed_today_kwh) * 100, 1) if consumed_today_kwh > 0 else 0

    return {
        "lamp_count": lamp_count,
        # Overall
        "solar_generated_kwh": round(solar_kwh, 3),
        "energy_consumed_kwh": round(consumed_kwh, 3),
        "co2_avoided_kg": round(solar_kwh * 0.85, 3),
        "efficiency_percent": round((solar_kwh / consumed_kwh) * 100, 2) if consumed_kwh else 0,
        # Today (fields expected by DashboardHome)
        "solar_generated_today": round(solar_today_kwh, 3),
        "consumed_today": round(consumed_today_kwh, 3),
        "efficiency_pct": efficiency_pct,
    }


async def get_cost_comparison(db: AsyncSession, hours_on: float = 12.0) -> dict:
    config = await db.scalar(
        select(EnergyCostConfig).where(EnergyCostConfig.is_active.is_(True))
    )
    lamp_count = await db.scalar(
        select(func.count()).select_from(Lamp).where(Lamp.is_deleted.is_(False))
    ) or 0
    rate = float(config.electricity_rate) if config else 1444.70
    watt = float(config.traditional_lamp_watt) if config and config.traditional_lamp_watt else 150.0
    traditional = (watt * hours_on * 30 / 1000) * rate * lamp_count
    return {
        "currency": config.currency if config else "IDR",
        "traditional_monthly_cost": round(traditional, 2),
        "smart_monthly_cost": 0,
        "estimated_saving": round(traditional, 2),
    }
