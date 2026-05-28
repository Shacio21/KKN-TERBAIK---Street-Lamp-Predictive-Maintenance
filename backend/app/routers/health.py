from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.mqtt_service import mqtt_service

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    checks = {}
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        checks["database"] = f"error: {exc}"
    checks["mqtt"] = "ok" if mqtt_service.is_connected() else "disconnected"
    status = "ok" if all(value == "ok" for value in checks.values()) else "degraded"
    return {"status": status, "services": checks, "timestamp": datetime.now(UTC)}
