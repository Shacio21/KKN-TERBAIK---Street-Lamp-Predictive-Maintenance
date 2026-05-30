from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Telemetry, User
from app.services.energy_service import get_cost_comparison, get_energy_summary

router = APIRouter(prefix="/energy", tags=["energy"])


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    return await get_energy_summary(db)


@router.get("/flow")
async def flow(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    rows = await db.scalars(select(Telemetry).order_by(Telemetry.time.desc()).limit(200))
    return [{"time": row.time, "solar_generated": row.solar_energy_today, "consumed": row.energy, "solar_power": row.solar_power, "load_power": row.power} for row in rows]


@router.get("/cost-comparison")
async def cost_comparison(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    return await get_cost_comparison(db)


@router.get("/impact")
async def impact(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    data = await get_energy_summary(db)
    return {"co2_avoided_kg": data["co2_avoided_kg"], "solar_generated_kwh": data["solar_generated_kwh"], "equivalent_trees": round(data["co2_avoided_kg"] / 21.77, 2)}
