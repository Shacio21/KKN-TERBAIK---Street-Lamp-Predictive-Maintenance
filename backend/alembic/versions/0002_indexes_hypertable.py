"""add indexes and timescaledb hypertable

Revision ID: 0002_indexes_hypertable
Revises: 0001_initial_schema
Create Date: 2026-05-27
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_indexes_hypertable"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Index for faster audit log queries
    op.create_index("idx_audit_logs_action", "audit_logs", ["action"])
    op.create_index("idx_audit_logs_created_at", "audit_logs", ["created_at"])
    op.create_index("idx_audit_logs_user_id", "audit_logs", ["user_id"])

    # Index for notification queries
    op.create_index("idx_notifications_user_unread", "notifications", ["user_id", "is_read"])

    # Index for alert queries
    op.create_index("idx_alerts_lamp_created", "alerts", ["lamp_id", "created_at"])
    op.create_index("idx_alerts_unresolved", "alerts", ["is_resolved", "created_at"])

    # Index for repair tickets
    op.create_index("idx_tickets_status_created", "repair_tickets", ["status", "created_at"])
    op.create_index("idx_tickets_assigned_to", "repair_tickets", ["assigned_to"])

    # Index for predictions
    op.create_index("idx_predictions_lamp_date", "predictions", ["lamp_id", "predicted_at"])

    # Index for device logs
    op.create_index("idx_device_logs_lamp_time", "device_logs", ["lamp_id", "time"])

    pass


def downgrade() -> None:
    op.drop_index("idx_audit_logs_action", "audit_logs")
    op.drop_index("idx_audit_logs_created_at", "audit_logs")
    op.drop_index("idx_audit_logs_user_id", "audit_logs")
    op.drop_index("idx_notifications_user_unread", "notifications")
    op.drop_index("idx_alerts_lamp_created", "alerts")
    op.drop_index("idx_alerts_unresolved", "alerts")
    op.drop_index("idx_tickets_status_created", "repair_tickets")
    op.drop_index("idx_tickets_assigned_to", "repair_tickets")
    op.drop_index("idx_predictions_lamp_date", "predictions")
    op.drop_index("idx_device_logs_lamp_time", "device_logs")
