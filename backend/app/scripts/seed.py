import asyncio
from datetime import UTC, datetime

from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models import AlertThreshold, EnergyCostConfig, User


DEFAULT_THRESHOLDS = [
    ("Tegangan rendah", "voltage", "lt", 190.0, 180.0),
    ("Tegangan tinggi", "voltage", "gt", 240.0, 250.0),
    ("Arus berlebih", "current", "gt", 5.0, 7.0),
    ("Suhu komponen tinggi", "temperature_internal", "gt", 60.0, 80.0),
    ("Suhu lingkungan tinggi", "temperature_ambient", "gt", 45.0, 55.0),
    ("Baterai rendah", "battery_level", "lt", 30.0, 15.0),
    ("Lampu offline", "offline_minutes", "gt", 30.0, 60.0),
    ("Sinyal lemah", "signal_strength", "lt", 20.0, 10.0),
]


async def seed() -> None:
    settings = get_settings()
    async with AsyncSessionLocal() as db:
        for name, metric, condition, warning_value, critical_value in DEFAULT_THRESHOLDS:
            exists = await db.scalar(select(AlertThreshold).where(AlertThreshold.metric == metric, AlertThreshold.condition == condition))
            if not exists:
                db.add(
                    AlertThreshold(
                        name=name,
                        metric=metric,
                        condition=condition,
                        warning_value=warning_value,
                        critical_value=critical_value,
                    )
                )

        energy_config = await db.scalar(select(EnergyCostConfig).where(EnergyCostConfig.is_active.is_(True)))
        if not energy_config:
            db.add(EnergyCostConfig(name="Tarif PLN Default", electricity_rate=1444.70, currency="IDR", traditional_lamp_watt=150.0))

        if settings.first_admin_email and settings.first_admin_password:
            admin = await db.scalar(select(User).where(User.email == settings.first_admin_email.lower()))
            if not admin:
                db.add(
                    User(
                        email=settings.first_admin_email.lower(),
                        name=settings.first_admin_name,
                        password_hash=hash_password(settings.first_admin_password),
                        role="admin",
                        status="active",
                        email_verified=True,
                        email_verified_at=datetime.now(UTC),
                    )
                )

        await db.commit()


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
