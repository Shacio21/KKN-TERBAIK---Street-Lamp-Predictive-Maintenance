#!/bin/bash
set -e

echo "=== PJU IoT Backend Startup ==="

# Run database migrations
echo "Running Alembic migrations..."
python -m alembic upgrade head

# Seed default data (admin user, alert thresholds, energy config)
echo "Seeding database..."
python -m app.scripts.seed

echo "Starting application..."
exec "$@"
