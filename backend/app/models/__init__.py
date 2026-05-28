import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, Time, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"


class UserStatus(str, enum.Enum):
    pending = "pending"
    awaiting_approval = "awaiting_approval"
    active = "active"
    suspended = "suspended"
    rejected = "rejected"


class LampStatus(str, enum.Enum):
    online = "online"
    warning = "warning"
    fault = "fault"
    maintenance = "maintenance"
    offline = "offline"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(Enum(UserRole, native_enum=False), default=UserRole.operator.value)
    status: Mapped[str] = mapped_column(Enum(UserStatus, native_enum=False), default=UserStatus.pending.value)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    phone: Mapped[str | None] = mapped_column(String(20))
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejected_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AuthToken(Base):
    __tablename__ = "auth_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token: Mapped[str] = mapped_column(String(500), unique=True, index=True)
    token_type: Mapped[str] = mapped_column(String(30), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user: Mapped[User] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str | None] = mapped_column(String(50))
    entity_id: Mapped[str | None] = mapped_column(String(100))
    detail: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str | None] = mapped_column(String(50))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    link: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AlertThreshold(Base):
    __tablename__ = "alert_thresholds"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    metric: Mapped[str] = mapped_column(String(50), index=True)
    condition: Mapped[str] = mapped_column(String(10))
    warning_value: Mapped[float | None] = mapped_column(Numeric(10, 3))
    critical_value: Mapped[float | None] = mapped_column(Numeric(10, 3))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Place(Base):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    type: Mapped[str | None] = mapped_column(String(30))
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("places.id"))
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8))
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8))
    description: Mapped[str | None] = mapped_column(Text)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Lamp(Base):
    __tablename__ = "lamps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    place_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("places.id"), index=True)
    latitude: Mapped[float | None] = mapped_column(Numeric(10, 8))
    longitude: Mapped[float | None] = mapped_column(Numeric(11, 8))
    status: Mapped[str] = mapped_column(Enum(LampStatus, native_enum=False), default=LampStatus.offline.value, index=True)
    health_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    risk_level: Mapped[str | None] = mapped_column(String(20))
    model: Mapped[str | None] = mapped_column(String(100))
    power_rating: Mapped[float | None] = mapped_column(Numeric(10, 2))
    panel_watt_peak: Mapped[float | None] = mapped_column(Numeric(10, 2))
    battery_capacity_wh: Mapped[float | None] = mapped_column(Numeric(10, 2))
    firmware_version: Mapped[str | None] = mapped_column(String(50))
    installed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_battery_level: Mapped[float | None] = mapped_column(Numeric(5, 2))
    last_brightness: Mapped[float | None] = mapped_column(Numeric(5, 2))
    last_signal_strength: Mapped[float | None] = mapped_column(Numeric(5, 2))
    telemetry_count: Mapped[int] = mapped_column(Integer, default=0)
    ml_ready: Mapped[bool] = mapped_column(Boolean, default=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    place: Mapped[Place | None] = relationship()


class LampSchedule(Base):
    __tablename__ = "lamp_schedules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_sunrise: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_sunset: Mapped[bool] = mapped_column(Boolean, default=True)
    on_time: Mapped[Any | None] = mapped_column(Time)
    off_time: Mapped[Any | None] = mapped_column(Time)
    dimming_schedule: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OtaJob(Base):
    __tablename__ = "ota_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    firmware_version: Mapped[str] = mapped_column(String(50))
    firmware_url: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(30), default="pending")
    triggered_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Telemetry(Base):
    __tablename__ = "telemetry"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lamp_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    voltage: Mapped[float | None] = mapped_column(Numeric(8, 2))
    current: Mapped[float | None] = mapped_column(Numeric(8, 3))
    power: Mapped[float | None] = mapped_column(Numeric(10, 2))
    energy: Mapped[float | None] = mapped_column(Numeric(12, 3))
    solar_voltage: Mapped[float | None] = mapped_column(Numeric(8, 2))
    solar_current: Mapped[float | None] = mapped_column(Numeric(8, 3))
    solar_power: Mapped[float | None] = mapped_column(Numeric(10, 2))
    solar_energy_today: Mapped[float | None] = mapped_column(Numeric(10, 3))
    battery_level: Mapped[float | None] = mapped_column(Numeric(5, 2))
    battery_voltage: Mapped[float | None] = mapped_column(Numeric(8, 3))
    battery_current: Mapped[float | None] = mapped_column(Numeric(8, 3))
    temperature_internal: Mapped[float | None] = mapped_column(Numeric(5, 2))
    temperature_ambient: Mapped[float | None] = mapped_column(Numeric(5, 2))
    lux: Mapped[float | None] = mapped_column(Numeric(10, 2))
    motion_count: Mapped[int] = mapped_column(Integer, default=0)
    signal_strength: Mapped[float | None] = mapped_column(Numeric(5, 2))
    mqtt_latency_ms: Mapped[int | None] = mapped_column(Integer)
    brightness: Mapped[float | None] = mapped_column(Numeric(5, 2))
    anomaly_score: Mapped[float | None] = mapped_column(Numeric(5, 3))
    raw_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)


class DeviceLog(Base):
    __tablename__ = "device_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lamp_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    log_level: Mapped[str] = mapped_column(String(10))
    event_code: Mapped[str | None] = mapped_column(String(50))
    message: Mapped[str | None] = mapped_column(Text)


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    failure_probability: Mapped[float | None] = mapped_column(Numeric(5, 3))
    days_to_failure: Mapped[int | None] = mapped_column(Integer)
    risk_level: Mapped[str | None] = mapped_column(String(20))
    recommendation: Mapped[str | None] = mapped_column(Text)
    model_version: Mapped[str | None] = mapped_column(String(50))
    confidence: Mapped[float | None] = mapped_column(Numeric(5, 3))


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    threshold_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("alert_thresholds.id"))
    alert_type: Mapped[str | None] = mapped_column(String(100))
    severity: Mapped[str | None] = mapped_column(String(20))
    message: Mapped[str | None] = mapped_column(Text)
    metric_value: Mapped[float | None] = mapped_column(Numeric(10, 3))
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolve_note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class RepairTicket(Base):
    __tablename__ = "repair_tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lamp_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lamps.id"), index=True)
    alert_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("alerts.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="open", index=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TicketLog(Base):
    __tablename__ = "ticket_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    ticket_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("repair_tickets.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    action: Mapped[str | None] = mapped_column(String(100))
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class TicketAttachment(Base):
    __tablename__ = "ticket_attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("repair_tickets.id", ondelete="CASCADE"), index=True)
    file_path: Mapped[str] = mapped_column(String(500))
    file_name: Mapped[str | None] = mapped_column(String(255))
    mime_type: Mapped[str | None] = mapped_column(String(50))
    file_size: Mapped[int | None] = mapped_column(Integer)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportJob(Base):
    __tablename__ = "report_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type: Mapped[str] = mapped_column(String(50))
    requested_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    filters: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    output_format: Mapped[str | None] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    file_path: Mapped[str | None] = mapped_column(String(500))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class EnergyCostConfig(Base):
    __tablename__ = "energy_cost_config"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    electricity_rate: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(10), default="IDR")
    traditional_lamp_watt: Mapped[float | None] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
