"""Database backup task via pg_dump.

Stores daily backups in /backups/ directory with rotation (keep last 7).
"""

import asyncio
import logging
import subprocess
from datetime import datetime
from pathlib import Path

from app.core.config import get_settings
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

BACKUP_DIR = Path(__file__).parent.parent.parent / "backups"
MAX_BACKUPS = 7  # Keep last 7 days


def _run_backup() -> dict:
    """Execute pg_dump and manage backup rotation."""
    settings = get_settings()

    # Parse database URL for pg_dump args
    # Format: postgresql+asyncpg://user:pass@host:port/dbname
    db_url = settings.database_url
    # Remove driver prefix
    clean_url = db_url.replace("postgresql+asyncpg://", "").replace("postgresql://", "")
    # Parse user:pass@host:port/dbname
    userpass, hostdb = clean_url.split("@", 1)
    user, password = userpass.split(":", 1) if ":" in userpass else (userpass, "")
    hostport, dbname = hostdb.split("/", 1)
    host, port = hostport.split(":", 1) if ":" in hostport else (hostport, "5432")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"pju_backup_{timestamp}.sql.gz"

    # Build pg_dump command with gzip compression
    env = {"PGPASSWORD": password}
    cmd = [
        "pg_dump",
        "-h", host,
        "-p", port,
        "-U", user,
        "-d", dbname,
        "--no-owner",
        "--no-privileges",
        "-Z", "6",  # gzip compression level
        "-f", str(backup_file),
    ]

    try:
        result = subprocess.run(
            cmd, env={**dict(__import__("os").environ), **env},
            capture_output=True, text=True, timeout=600,
        )
        if result.returncode != 0:
            logger.error(f"pg_dump failed: {result.stderr}")
            return {"success": False, "error": result.stderr[:500]}

        file_size = backup_file.stat().st_size
        logger.info(f"Backup created: {backup_file} ({file_size / 1024 / 1024:.1f} MB)")

        # Rotate old backups
        backups = sorted(BACKUP_DIR.glob("pju_backup_*.sql.gz"), key=lambda p: p.stat().st_mtime, reverse=True)
        for old_backup in backups[MAX_BACKUPS:]:
            old_backup.unlink()
            logger.info(f"Deleted old backup: {old_backup.name}")

        return {
            "success": True,
            "file": str(backup_file),
            "size_mb": round(file_size / 1024 / 1024, 2),
            "total_backups": min(len(backups), MAX_BACKUPS),
        }

    except subprocess.TimeoutExpired:
        logger.error("pg_dump timed out after 600s")
        return {"success": False, "error": "Backup timed out"}
    except FileNotFoundError:
        logger.warning("pg_dump not found - is PostgreSQL client installed?")
        return {"success": False, "error": "pg_dump not found"}
    except Exception as e:
        logger.error(f"Backup error: {e}")
        return {"success": False, "error": str(e)[:500]}


@celery_app.task
def run_database_backup() -> str:
    """Celery task: Run daily database backup."""
    result = _run_backup()
    if result["success"]:
        return f"Backup OK: {result['file']} ({result['size_mb']} MB), {result['total_backups']} total"
    else:
        return f"Backup FAILED: {result['error']}"
