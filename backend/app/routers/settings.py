from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models import AlertThreshold, AuditLog, EnergyCostConfig, User
from app.schemas.common import Message

# ── General settings (for SettingsPage frontend) ──────────────
settings_router = APIRouter(prefix="/settings", tags=["settings"])

# In-memory system settings (persisted would use a DB table)
_system_settings: dict = {
    "telemetry_interval_seconds": 120,
    "alert_email_enabled": True,
    "auto_create_ticket_on_fault": True,
    "ml_prediction_enabled": True,
    "ml_min_data_points": 48,
    "battery_low_threshold": 20,
    "solar_efficiency_target": 80,
    "maintenance_reminder_days": 7,
    "max_offline_minutes": 30,
    "system_name": "PJU Smart Monitoring",
}


@settings_router.get("")
async def get_settings_values(_: User = Depends(require_admin)) -> dict:
    return _system_settings


@settings_router.put("")
async def update_settings_values(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    allowed_keys = set(_system_settings.keys())
    for key, value in payload.items():
        if key in allowed_keys:
            _system_settings[key] = value
    db.add(AuditLog(
        user_id=admin.id, action="settings.update",
        entity_type="system", detail=payload,
    ))
    await db.commit()
    return _system_settings


# ── Admin settings (thresholds, energy, ML, firmware) ─────────
router = APIRouter(prefix="/admin/settings", tags=["settings"])


@router.get("/thresholds")
async def list_thresholds(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = await db.scalars(select(AlertThreshold).order_by(AlertThreshold.name))
    return [{"id": row.id, "name": row.name, "metric": row.metric, "condition": row.condition, "warning_value": row.warning_value, "critical_value": row.critical_value, "is_active": row.is_active} for row in rows]


@router.post("/thresholds")
async def create_threshold(payload: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_admin)) -> dict:
    threshold = AlertThreshold(created_by=user.id, **payload)
    db.add(threshold)
    await db.commit()
    await db.refresh(threshold)
    return {"id": threshold.id}


@router.put("/thresholds/{threshold_id}")
async def update_threshold(threshold_id: UUID, payload: dict, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    threshold = await db.get(AlertThreshold, threshold_id)
    if not threshold:
        raise HTTPException(404, "Threshold tidak ditemukan")
    for key, value in payload.items():
        if hasattr(threshold, key):
            setattr(threshold, key, value)
    await db.commit()
    return {"id": threshold.id}


@router.patch("/thresholds/{threshold_id}", response_model=Message)
async def toggle_threshold(threshold_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> Message:
    threshold = await db.get(AlertThreshold, threshold_id)
    if not threshold:
        raise HTTPException(404, "Threshold tidak ditemukan")
    threshold.is_active = not threshold.is_active
    await db.commit()
    return Message(message="Status threshold diperbarui")


@router.get("/energy-cost")
async def energy_cost(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = await db.scalars(select(EnergyCostConfig).order_by(EnergyCostConfig.created_at.desc()))
    return [{"id": row.id, "name": row.name, "electricity_rate": row.electricity_rate, "currency": row.currency, "traditional_lamp_watt": row.traditional_lamp_watt, "is_active": row.is_active} for row in rows]


@router.put("/energy-cost/{config_id}")
async def update_energy_cost(config_id: UUID, payload: dict, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    config = await db.get(EnergyCostConfig, config_id)
    if not config:
        raise HTTPException(404, "Konfigurasi biaya tidak ditemukan")
    for key, value in payload.items():
        if hasattr(config, key):
            setattr(config, key, value)
    await db.commit()
    return {"id": config.id}


@router.get("/ml-models")
async def ml_models(_: User = Depends(require_admin)) -> list[dict]:
    return []


@router.post("/ml-train", response_model=Message)
async def train_ml(_: User = Depends(require_admin)) -> Message:
    return Message(message="Training ML dijadwalkan")


@router.get("/firmware")
async def firmware(_: User = Depends(require_admin)) -> list[dict]:
    return []


@router.post("/firmware")
async def upload_firmware(_: User = Depends(require_admin)) -> dict:
    return {"message": "Endpoint upload firmware siap dikembangkan"}


@router.delete("/firmware/{firmware_id}", response_model=Message)
async def delete_firmware(firmware_id: str, _: User = Depends(require_admin)) -> Message:
    return Message(message=f"Firmware {firmware_id} dihapus")
