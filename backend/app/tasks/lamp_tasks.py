"""Offline lamp detection task.

Runs every 5 minutes via Celery Beat. Marks lamps as 'offline' if they
haven't sent telemetry within the configured threshold (default 30 min).
Creates alerts and notifications for newly-offline lamps.
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update

from app.core.database import AsyncSessionLocal
from app.models import Alert, Lamp, LampStatus, Notification, User
from app.tasks.celery_app import celery_app

import asyncio

DEFAULT_OFFLINE_THRESHOLD_MINUTES = 30


async def _check_offline() -> dict:
    """Async implementation of offline detection."""
    async with AsyncSessionLocal() as db:
        threshold = datetime.now(UTC) - timedelta(minutes=DEFAULT_OFFLINE_THRESHOLD_MINUTES)

        # Find lamps that are currently online/warning but haven't been seen recently
        stale_lamps = list(
            await db.scalars(
                select(Lamp).where(
                    Lamp.is_deleted.is_(False),
                    Lamp.status.in_([LampStatus.online.value, LampStatus.warning.value]),
                    Lamp.last_seen.isnot(None),
                    Lamp.last_seen < threshold,
                )
            )
        )

        if not stale_lamps:
            return {"checked": 0, "offline": 0}

        newly_offline_ids = []
        for lamp in stale_lamps:
            lamp.status = LampStatus.offline.value
            newly_offline_ids.append(lamp.id)

            # Create alert for each newly-offline lamp
            alert = Alert(
                lamp_id=lamp.id,
                alert_type="connectivity",
                severity="warning",
                message=f"Lampu {lamp.lamp_code} offline — tidak ada data selama >{DEFAULT_OFFLINE_THRESHOLD_MINUTES} menit",
                metric_value=None,
            )
            db.add(alert)

        # Notify all admin users about offline lamps
        if newly_offline_ids:
            admins = list(
                await db.scalars(
                    select(User).where(User.role == "admin", User.status == "active")
                )
            )
            lamp_codes = [l.lamp_code for l in stale_lamps]
            for admin in admins:
                notif = Notification(
                    user_id=admin.id,
                    title=f"{len(newly_offline_ids)} lampu terdeteksi offline",
                    message=f"Lampu yang offline: {', '.join(lamp_codes[:5])}{'...' if len(lamp_codes) > 5 else ''}",
                    type="lamp_fault",
                )
                db.add(notif)

        await db.commit()

        return {"checked": len(stale_lamps), "offline": len(newly_offline_ids)}


@celery_app.task
def check_offline_lamps() -> str:
    """Celery task wrapper for offline lamp detection."""
    result = asyncio.run(_check_offline())
    return f"Checked: {result['checked']}, Newly offline: {result['offline']}"
