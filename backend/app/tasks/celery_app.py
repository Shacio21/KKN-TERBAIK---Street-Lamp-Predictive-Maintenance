from celery import Celery

from app.core.config import get_settings


settings = get_settings()
celery_app = Celery("pju_backend", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.beat_schedule = {
    "check-offline": {"task": "app.tasks.lamp_tasks.check_offline_lamps", "schedule": 300.0},
    "daily-ml": {"task": "app.tasks.ml_tasks.run_daily_ml_all_lamps", "schedule": 86400.0},
    "daily-backup": {"task": "app.tasks.backup_tasks.run_database_backup", "schedule": 86400.0},
}
