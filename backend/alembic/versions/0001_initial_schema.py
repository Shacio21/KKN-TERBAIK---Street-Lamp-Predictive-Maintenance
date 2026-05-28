"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-26
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="pending"),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("phone", sa.String(20)),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("email_verified_at", sa.DateTime(timezone=True)),
        sa.Column("approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("rejected_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("rejected_at", sa.DateTime(timezone=True)),
        sa.Column("rejection_reason", sa.Text()),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_table(
        "auth_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("token", sa.String(500), nullable=False, unique=True),
        sa.Column("token_type", sa.String(30), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True)),
        sa.Column("is_revoked", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_auth_tokens_token", "auth_tokens", ["token"])
    op.create_index("idx_auth_tokens_user_type", "auth_tokens", ["user_id", "token_type"])
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(50)),
        sa.Column("entity_id", sa.String(100)),
        sa.Column("detail", postgresql.JSONB()),
        sa.Column("ip_address", sa.String(45)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text()),
        sa.Column("type", sa.String(50)),
        sa.Column("is_read", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.Column("link", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "alert_thresholds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("metric", sa.String(50), nullable=False),
        sa.Column("condition", sa.String(10), nullable=False),
        sa.Column("warning_value", sa.Numeric(10, 3)),
        sa.Column("critical_value", sa.Numeric(10, 3)),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "places",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.String(30)),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("places.id")),
        sa.Column("latitude", sa.Numeric(10, 8)),
        sa.Column("longitude", sa.Numeric(11, 8)),
        sa.Column("description", sa.Text()),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "lamps",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lamp_code", sa.String(100), nullable=False, unique=True),
        sa.Column("place_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("places.id")),
        sa.Column("latitude", sa.Numeric(10, 8)),
        sa.Column("longitude", sa.Numeric(11, 8)),
        sa.Column("status", sa.String(30), server_default="offline"),
        sa.Column("health_score", sa.Numeric(5, 2)),
        sa.Column("risk_level", sa.String(20)),
        sa.Column("model", sa.String(100)),
        sa.Column("power_rating", sa.Numeric(10, 2)),
        sa.Column("panel_watt_peak", sa.Numeric(10, 2)),
        sa.Column("battery_capacity_wh", sa.Numeric(10, 2)),
        sa.Column("firmware_version", sa.String(50)),
        sa.Column("installed_at", sa.DateTime(timezone=True)),
        sa.Column("last_seen", sa.DateTime(timezone=True)),
        sa.Column("last_battery_level", sa.Numeric(5, 2)),
        sa.Column("last_brightness", sa.Numeric(5, 2)),
        sa.Column("last_signal_strength", sa.Numeric(5, 2)),
        sa.Column("telemetry_count", sa.Integer(), server_default="0"),
        sa.Column("ml_ready", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("is_deleted", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_lamps_place", "lamps", ["place_id"])
    op.create_index("idx_lamps_status", "lamps", ["status"])
    op.create_table("lamp_schedules", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id", ondelete="CASCADE")), sa.Column("name", sa.String(100), nullable=False), sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")), sa.Column("auto_sunrise", sa.Boolean(), server_default=sa.text("true")), sa.Column("auto_sunset", sa.Boolean(), server_default=sa.text("true")), sa.Column("on_time", sa.Time()), sa.Column("off_time", sa.Time()), sa.Column("dimming_schedule", postgresql.JSONB(), server_default="[]"), sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("ota_jobs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("firmware_version", sa.String(50), nullable=False), sa.Column("firmware_url", sa.String(500), nullable=False), sa.Column("status", sa.String(30), server_default="pending"), sa.Column("triggered_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.Column("error_message", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("telemetry", sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("time", sa.DateTime(timezone=True), nullable=False), sa.Column("voltage", sa.Numeric(8, 2)), sa.Column("current", sa.Numeric(8, 3)), sa.Column("power", sa.Numeric(10, 2)), sa.Column("energy", sa.Numeric(12, 3)), sa.Column("solar_voltage", sa.Numeric(8, 2)), sa.Column("solar_current", sa.Numeric(8, 3)), sa.Column("solar_power", sa.Numeric(10, 2)), sa.Column("solar_energy_today", sa.Numeric(10, 3)), sa.Column("battery_level", sa.Numeric(5, 2)), sa.Column("battery_voltage", sa.Numeric(8, 3)), sa.Column("battery_current", sa.Numeric(8, 3)), sa.Column("temperature_internal", sa.Numeric(5, 2)), sa.Column("temperature_ambient", sa.Numeric(5, 2)), sa.Column("lux", sa.Numeric(10, 2)), sa.Column("motion_count", sa.Integer(), server_default="0"), sa.Column("signal_strength", sa.Numeric(5, 2)), sa.Column("mqtt_latency_ms", sa.Integer()), sa.Column("brightness", sa.Numeric(5, 2)), sa.Column("anomaly_score", sa.Numeric(5, 3)), sa.Column("raw_payload", postgresql.JSONB()))
    op.create_index("idx_telemetry_lamp_time", "telemetry", ["lamp_id", "time"])
    op.create_table("device_logs", sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("time", sa.DateTime(timezone=True), nullable=False), sa.Column("log_level", sa.String(10), nullable=False), sa.Column("event_code", sa.String(50)), sa.Column("message", sa.Text()))
    op.create_table("predictions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("predicted_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("failure_probability", sa.Numeric(5, 3)), sa.Column("days_to_failure", sa.Integer()), sa.Column("risk_level", sa.String(20)), sa.Column("recommendation", sa.Text()), sa.Column("model_version", sa.String(50)), sa.Column("confidence", sa.Numeric(5, 3)))
    op.create_table("alerts", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("threshold_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alert_thresholds.id")), sa.Column("alert_type", sa.String(100)), sa.Column("severity", sa.String(20)), sa.Column("message", sa.Text()), sa.Column("metric_value", sa.Numeric(10, 3)), sa.Column("is_resolved", sa.Boolean(), server_default=sa.text("false")), sa.Column("resolved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("resolved_at", sa.DateTime(timezone=True)), sa.Column("resolve_note", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("repair_tickets", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("lamp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lamps.id")), sa.Column("alert_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("alerts.id")), sa.Column("title", sa.String(255), nullable=False), sa.Column("description", sa.Text()), sa.Column("status", sa.String(30), server_default="open"), sa.Column("priority", sa.String(20), server_default="medium"), sa.Column("assigned_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("resolved_at", sa.DateTime(timezone=True)), sa.Column("resolution_note", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("ticket_logs", sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True), sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("repair_tickets.id", ondelete="CASCADE")), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("action", sa.String(100)), sa.Column("note", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("ticket_attachments", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("ticket_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("repair_tickets.id", ondelete="CASCADE")), sa.Column("file_path", sa.String(500), nullable=False), sa.Column("file_name", sa.String(255)), sa.Column("mime_type", sa.String(50)), sa.Column("file_size", sa.Integer()), sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_table("report_jobs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("report_type", sa.String(50), nullable=False), sa.Column("requested_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("filters", postgresql.JSONB()), sa.Column("output_format", sa.String(10)), sa.Column("status", sa.String(20), server_default="pending"), sa.Column("file_path", sa.String(500)), sa.Column("error_message", sa.Text()), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("completed_at", sa.DateTime(timezone=True)))
    op.create_table("energy_cost_config", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")), sa.Column("name", sa.String(100), nullable=False), sa.Column("electricity_rate", sa.Numeric(10, 2), nullable=False), sa.Column("currency", sa.String(10), server_default="IDR"), sa.Column("traditional_lamp_watt", sa.Numeric(10, 2)), sa.Column("is_active", sa.Boolean(), server_default=sa.text("true")), sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.execute("""
        INSERT INTO alert_thresholds (name, metric, condition, warning_value, critical_value) VALUES
        ('Tegangan rendah', 'voltage', 'lt', 190.0, 180.0),
        ('Tegangan tinggi', 'voltage', 'gt', 240.0, 250.0),
        ('Arus berlebih', 'current', 'gt', 5.0, 7.0),
        ('Suhu komponen tinggi', 'temperature_internal', 'gt', 60.0, 80.0),
        ('Suhu lingkungan tinggi', 'temperature_ambient', 'gt', 45.0, 55.0),
        ('Baterai rendah', 'battery_level', 'lt', 30.0, 15.0),
        ('Lampu offline', 'offline_minutes', 'gt', 30.0, 60.0),
        ('Sinyal lemah', 'signal_strength', 'lt', 20.0, 10.0)
    """)
    op.execute("INSERT INTO energy_cost_config (name, electricity_rate, currency, traditional_lamp_watt) VALUES ('Tarif PLN Default', 1444.70, 'IDR', 150.0)")


def downgrade() -> None:
    for table in [
        "energy_cost_config", "report_jobs", "ticket_attachments", "ticket_logs", "repair_tickets", "alerts",
        "predictions", "device_logs", "telemetry", "ota_jobs", "lamp_schedules", "lamps", "places",
        "alert_thresholds", "notifications", "audit_logs", "auth_tokens", "users",
    ]:
        op.drop_table(table)
