from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.routers import (
    admin_users, alerts, audit_logs, auth, energy, health, iot,
    lamps, monitoring, notifications, places, public, reports,
    search, settings, tickets, users_me, websocket,
)
from app.services.mqtt_service import mqtt_service

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start MQTT service
    try:
        await mqtt_service.start()
    except Exception:
        pass  # Don't crash if MQTT broker is unavailable
    yield
    try:
        await mqtt_service.stop()
    except Exception:
        pass


settings_obj = get_settings()
app = FastAPI(title=settings_obj.app_name, version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings_obj.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (avatars, attachments)
import os

upload_dir = settings_obj.upload_dir
if not os.path.isabs(upload_dir):
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), upload_dir)
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(users_me.router)
app.include_router(admin_users.router)
app.include_router(audit_logs.router)
app.include_router(notifications.router)
app.include_router(settings.settings_router)
app.include_router(settings.router)
app.include_router(places.router)
app.include_router(lamps.router)
app.include_router(iot.router)
app.include_router(monitoring.router)
app.include_router(energy.router)
app.include_router(alerts.router)
app.include_router(tickets.router)
app.include_router(reports.router)
app.include_router(search.router)
app.include_router(health.router)
app.include_router(websocket.router)
app.include_router(public.router)


@app.get("/")
async def root() -> dict:
    return {"name": settings_obj.app_name, "version": "1.0.0", "docs": "/docs", "health": "/health"}
