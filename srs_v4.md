# SRS Website Monitoring PJU Berbasis IoT
### Versi Final v4 — Disesuaikan dengan Frontend Smart Solar Street Lamp

---

## DAFTAR ISI

1. Stack Teknologi
2. Package FastAPI (requirements.txt)
3. Database Schema
4. Alur Registrasi & Persetujuan Admin
5. Strategi Auth & Keamanan Token
6. Role & Permission (Admin, Operator)
7. Halaman & Fitur Lengkap
8. API Endpoint
9. Format Data MQTT (IoT)
10. Background Jobs & Offline Detection
11. ML — Training & Handling Data Baru
12. Agregasi Telemetry Jangka Panjang
13. Konfigurasi (.env)
14. Email Templates
15. Struktur Folder & Urutan Eksekusi
16. Backup & Recovery Database

---

## 1. STACK TEKNOLOGI

### Frontend
- **Next.js 14** (TypeScript, App Router)
- **Leaflet + OpenStreetMap / Esri Satellite**
- **Tailwind CSS** (dengan class `dark:` untuk dark mode)
- **WebSocket native** (bukan Socket.IO — lebih ringan, cukup untuk kebutuhan ini)
- **Recharts** (grafik monitoring: telemetry, energy flow, sensor analytics)
- **react-leaflet-cluster** (clustering marker peta)

### Backend
- **FastAPI** (Python 3.11+)
- **Pydantic v2** + **SQLAlchemy 2.0** (async)
- **JWT Authentication** — access token via Authorization header, refresh token via HttpOnly cookie
- Pengecekan role manual via dependency (`if user.role != "admin"`) — tidak pakai package RBAC eksternal
- **MQTT Client** (aiomqtt async) — subscribe telemetry + publish command ke device
- **WebSocket** (native FastAPI)
- **Celery + Redis** (background jobs: email, ML, alert, offline detection, laporan, backup)

### Database
- **PostgreSQL 15+**
- **TimescaleDB** extension (time-series telemetry + agregasi otomatis)
- **Redis** (Celery broker, WebSocket pub/sub broadcast, KPI cache)

### Message Broker IoT
- **EMQX** (recommended) atau Mosquitto
- Backend: subscribe (telemetry, heartbeat, device log)
- Backend: publish (brightness command, schedule command, OTA trigger)

### Machine Learning
- scikit-learn / XGBoost
- Pandas / NumPy / joblib
- Feature: voltage, current, power, battery_level, temperature_internal, temperature_ambient, anomaly_score, lux
- Terintegrasi langsung di FastAPI via Celery background task

### Deployment
- **Podman** containers:
  - `frontend` (Next.js)
  - `backend` (FastAPI + Uvicorn)
  - `postgres` (PostgreSQL + TimescaleDB)
  - `redis`
  - `mqtt` (EMQX)
  - `celery_worker` (background jobs)
  - `celery_beat` (scheduler)

---

## 2. PACKAGE FASTAPI — requirements.txt

```
# ============================================================
# CORE FRAMEWORK
# ============================================================
fastapi==0.111.0
uvicorn[standard]==0.30.1          # ASGI server
python-multipart==0.0.9            # Form data & file upload

# ============================================================
# DATABASE
# ============================================================
sqlalchemy==2.0.31                 # ORM async
asyncpg==0.29.0                    # Driver async PostgreSQL
alembic==1.13.2                    # Migrasi schema database
psycopg2-binary==2.9.9             # Driver sync (dipakai Alembic)

# ============================================================
# REDIS & CACHE
# ============================================================
redis[hiredis]==5.0.7
aioredis==2.0.1

# ============================================================
# AUTH & SECURITY
# ============================================================
python-jose[cryptography]==3.3.0   # Generate & verify JWT
passlib[bcrypt]==1.7.4             # Hash password
bcrypt==4.1.3
cryptography==42.0.8
itsdangerous==2.2.0                # Sign/verify HttpOnly cookie refresh token

# ============================================================
# EMAIL
# ============================================================
fastapi-mail==1.4.1
jinja2==3.1.4

# ============================================================
# VALIDASI
# ============================================================
pydantic==2.7.4
pydantic-settings==2.3.4
email-validator==2.2.0

# ============================================================
# MQTT
# ============================================================
aiomqtt==2.0.0                     # Async MQTT client (subscribe + publish)
paho-mqtt==2.1.0                   # Sync fallback / testing

# ============================================================
# WEBSOCKET
# ============================================================
websockets==12.0

# ============================================================
# BACKGROUND JOBS
# ============================================================
celery[redis]==5.4.0
flower==2.0.1

# ============================================================
# RATE LIMITING
# ============================================================
slowapi==0.1.9

# ============================================================
# FILE & STORAGE
# ============================================================
aiofiles==23.2.1
python-magic==0.4.27               # Magic bytes file type check
Pillow==10.4.0                     # Resize & compress foto profil

# ============================================================
# MACHINE LEARNING
# ============================================================
scikit-learn==1.5.1
xgboost==2.1.0
pandas==2.2.2
numpy==2.0.0
joblib==1.4.2

# ============================================================
# HTTP CLIENT
# ============================================================
httpx==0.27.0

# ============================================================
# LOGGING & ERROR TRACKING
# ============================================================
loguru==0.7.2
sentry-sdk[fastapi]==2.7.1

# ============================================================
# EXPORT LAPORAN
# ============================================================
openpyxl==3.1.5
reportlab==4.2.2

# ============================================================
# TESTING
# ============================================================
pytest==8.2.2
pytest-asyncio==0.23.7
factory-boy==3.3.0

# ============================================================
# DEV TOOLS
# ============================================================
python-dotenv==1.0.1
```

### Penjelasan Package Kunci

| Package | Fungsi |
|---|---|
| `fastapi-mail` + `jinja2` | Kirim email HTML (verifikasi, reset password, notifikasi) |
| `python-jose` | Generate & verify JWT access token |
| `itsdangerous` | Sign HttpOnly cookie untuk refresh token (anti-tamper) |
| `passlib[bcrypt]` | Hash password aman |
| `email-validator` | Validasi format email saat register |
| `python-magic` | Deteksi tipe file via magic bytes |
| `pydantic-settings` | Load semua config dari `.env` |
| `alembic` | Migrasi schema database tanpa drop |
| `aiomqtt` | Subscribe telemetry + publish command ke device (brightness, OTA, schedule) |
| `celery[redis]` | Background jobs: email, ML, offline detection, laporan, backup |
| `slowapi` | Rate limit endpoint login dan register |
| `openpyxl` + `reportlab` | Export laporan Excel & PDF |
| `Pillow` | Resize & compress foto profil user |
| `loguru` | Structured logging + audit trail |

> **Catatan RBAC**: Tidak ada package RBAC eksternal.
> ```python
> async def require_admin(current_user = Depends(get_current_active_user)):
>     if current_user.role != "admin":
>         raise HTTPException(403, "Hanya admin yang dapat mengakses ini")
>     return current_user
> ```

---

## 3. DATABASE SCHEMA

```sql
-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(20) NOT NULL,       -- 'admin' | 'operator'
    status              VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- 'pending' | 'awaiting_approval' | 'active' | 'suspended' | 'rejected'
    avatar_url          VARCHAR(500),
    phone               VARCHAR(20),
    email_verified      BOOLEAN DEFAULT FALSE,
    email_verified_at   TIMESTAMPTZ,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    rejected_by         UUID REFERENCES users(id),
    rejected_at         TIMESTAMPTZ,
    rejection_reason    TEXT,
    last_login_at       TIMESTAMPTZ,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTH TOKENS
-- ============================================================
CREATE TABLE auth_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) UNIQUE NOT NULL,
    token_type  VARCHAR(30) NOT NULL,
    -- 'email_verify' | 'password_reset' | 'refresh'
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    is_revoked  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_user_type ON auth_tokens(user_id, token_type);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    -- 'user.approve' | 'user.reject' | 'lamp.delete' | 'alert.resolve'
    -- 'lamp.brightness_set' | 'lamp.schedule_set' | 'lamp.ota_trigger'
    entity_type VARCHAR(50),
    entity_id   VARCHAR(100),
    detail      JSONB,          -- snapshot sebelum/sesudah
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ============================================================
-- IN-APP NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    type        VARCHAR(50),
    -- 'alert' | 'approval_request' | 'account_approved' | 'lamp_fault'
    -- 'maintenance_due' | 'battery_low' | 'ota_complete' | 'ota_failed'
    is_read     BOOLEAN DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- ============================================================
-- ALERT THRESHOLDS (dikonfigurasi admin)
-- ============================================================
CREATE TABLE alert_thresholds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    metric          VARCHAR(50) NOT NULL,
    -- 'voltage' | 'current' | 'power' | 'temperature_internal'
    -- 'temperature_ambient' | 'battery_level' | 'offline_minutes'
    -- 'lux' | 'signal_strength'
    condition       VARCHAR(10) NOT NULL,    -- 'lt' | 'gt'
    warning_value   DECIMAL(10,3),
    critical_value  DECIMAL(10,3),
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data default threshold (sesuai frontend)
INSERT INTO alert_thresholds (name, metric, condition, warning_value, critical_value) VALUES
('Tegangan rendah',       'voltage',             'lt', 190.0, 180.0),
('Tegangan tinggi',       'voltage',             'gt', 240.0, 250.0),
('Arus berlebih',         'current',             'gt', 5.0,   7.0),
('Suhu komponen tinggi',  'temperature_internal','gt', 60.0,  80.0),
('Suhu lingkungan tinggi','temperature_ambient', 'gt', 45.0,  55.0),
('Baterai rendah',        'battery_level',       'lt', 30.0,  15.0),
('Lampu offline',         'offline_minutes',     'gt', 30.0,  60.0),
('Sinyal lemah',          'signal_strength',     'lt', 20.0,  10.0);

-- ============================================================
-- PLACES
-- ============================================================
CREATE TABLE places (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(30),    -- 'desa' | 'street' | 'zone' | 'area'
    parent_id   UUID REFERENCES places(id),
    latitude    DECIMAL(10,8),
    longitude   DECIMAL(11,8),
    description TEXT,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LAMPS
-- ============================================================
CREATE TABLE lamps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_code           VARCHAR(100) UNIQUE NOT NULL,
    place_id            UUID REFERENCES places(id),
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    status              VARCHAR(30) DEFAULT 'offline',
    -- 'online' | 'warning' | 'fault' | 'maintenance' | 'offline'
    -- Status 'warning' bisa dipicu oleh: battery rendah, sinyal lemah, suhu tinggi
    health_score        DECIMAL(5,2),
    risk_level          VARCHAR(20),    -- 'high' | 'medium' | 'low' | 'unknown'
    model               VARCHAR(100),
    power_rating        DECIMAL(10,2),  -- Watt
    panel_watt_peak     DECIMAL(10,2),  -- Wp (watt peak panel surya)
    battery_capacity_wh DECIMAL(10,2),  -- Wh (kapasitas baterai LiFePO4)
    firmware_version    VARCHAR(50),
    installed_at        TIMESTAMPTZ,
    last_seen           TIMESTAMPTZ,
    -- Cached last telemetry values (untuk tampilan cepat di tabel/map)
    last_battery_level  DECIMAL(5,2),   -- % (0-100)
    last_brightness     DECIMAL(5,2),   -- % (0-100)
    last_signal_strength DECIMAL(5,2),  -- % (0-100)
    -- Data readiness flag untuk ML
    telemetry_count     INTEGER DEFAULT 0,
    ml_ready            BOOLEAN DEFAULT FALSE,
    is_deleted          BOOLEAN DEFAULT FALSE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_lamps_place ON lamps(place_id);
CREATE INDEX idx_lamps_status ON lamps(status);

-- ============================================================
-- LAMP SCHEDULES (jadwal on/off + dimming otomatis)
-- ============================================================
CREATE TABLE lamp_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_id         UUID NOT NULL REFERENCES lamps(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,  -- e.g. 'Jadwal Normal', 'Jadwal Ramadan'
    is_active       BOOLEAN DEFAULT TRUE,
    -- Mode sunrise/sunset: backend hitung jam berdasarkan koordinat
    auto_sunrise    BOOLEAN DEFAULT TRUE,   -- ON saat matahari terbenam
    auto_sunset     BOOLEAN DEFAULT TRUE,   -- OFF saat matahari terbit
    -- Override manual (dipakai jika auto_sunrise/sunset = false)
    on_time         TIME,                   -- e.g. '18:00'
    off_time        TIME,                   -- e.g. '06:00'
    -- Dimming schedule: array JSON [{"hour": 22, "brightness": 50}, ...]
    -- Brightness 100% = full, 0% = off
    dimming_schedule JSONB DEFAULT '[]',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_schedules_lamp ON lamp_schedules(lamp_id);

-- ============================================================
-- OTA FIRMWARE JOBS
-- ============================================================
CREATE TABLE ota_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_id         UUID NOT NULL REFERENCES lamps(id),
    firmware_version VARCHAR(50) NOT NULL,   -- versi target
    firmware_url    VARCHAR(500) NOT NULL,   -- URL file firmware
    status          VARCHAR(30) DEFAULT 'pending',
    -- 'pending' | 'sent' | 'downloading' | 'installing' | 'success' | 'failed'
    triggered_by    UUID REFERENCES users(id),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ota_lamp ON ota_jobs(lamp_id, created_at DESC);

-- ============================================================
-- TELEMETRY (TimescaleDB hypertable)
-- Field disesuaikan dengan sensor ESP32 + panel surya + baterai LiFePO4
-- ============================================================
CREATE TABLE telemetry (
    id                   BIGSERIAL,
    lamp_id              UUID NOT NULL REFERENCES lamps(id),
    time                 TIMESTAMPTZ NOT NULL,
    -- Electrical (beban lampu)
    voltage              DECIMAL(8,2),       -- Volt AC/DC beban
    current              DECIMAL(8,3),       -- Ampere beban
    power                DECIMAL(10,2),      -- Watt beban
    energy               DECIMAL(12,3),      -- kWh kumulatif beban
    -- Solar panel
    solar_voltage        DECIMAL(8,2),       -- Volt panel
    solar_current        DECIMAL(8,3),       -- Ampere panel
    solar_power          DECIMAL(10,2),      -- Watt input dari panel (solar_input)
    solar_energy_today   DECIMAL(10,3),      -- Wh dihasilkan hari ini
    -- Battery LiFePO4
    battery_level        DECIMAL(5,2),       -- % (0-100)
    battery_voltage      DECIMAL(8,3),       -- Volt baterai
    battery_current      DECIMAL(8,3),       -- Ampere charging/discharging (+/-)
    -- Sensors
    temperature_internal DECIMAL(5,2),       -- °C suhu komponen/controller
    temperature_ambient  DECIMAL(5,2),       -- °C suhu lingkungan
    lux                  DECIMAL(10,2),      -- lux intensitas cahaya ambient
    motion_count         INTEGER DEFAULT 0,  -- jumlah event motion per interval
    -- Connectivity
    signal_strength      DECIMAL(5,2),       -- % (0-100) kualitas sinyal WiFi/MQTT
    mqtt_latency_ms      INTEGER,            -- ms latency ke broker
    -- Control state
    brightness           DECIMAL(5,2),       -- % brightness lampu saat ini (0-100)
    -- ML output
    anomaly_score        DECIMAL(5,3),       -- 0.0-1.0 (dihitung backend saat insert)
    -- Raw
    raw_payload          JSONB,
    PRIMARY KEY (id, time)
);
SELECT create_hypertable('telemetry', 'time');
-- Retensi data detail: 90 hari
SELECT add_retention_policy('telemetry', INTERVAL '90 days');

-- ============================================================
-- DEVICE LOGS (event log dari firmware, bukan telemetry metrik)
-- ============================================================
CREATE TABLE device_logs (
    id          BIGSERIAL,
    lamp_id     UUID NOT NULL REFERENCES lamps(id),
    time        TIMESTAMPTZ NOT NULL,
    log_level   VARCHAR(10) NOT NULL,   -- 'info' | 'warn' | 'error'
    event_code  VARCHAR(50),
    -- 'reboot' | 'ota_start' | 'ota_success' | 'ota_fail'
    -- 'sensor_error' | 'battery_critical' | 'wifi_reconnect'
    message     TEXT,
    PRIMARY KEY (id, time)
);
SELECT create_hypertable('device_logs', 'time');
SELECT add_retention_policy('device_logs', INTERVAL '30 days');
CREATE INDEX idx_device_logs_lamp ON device_logs(lamp_id, time DESC);

-- ============================================================
-- TELEMETRY AGGREGATE (untuk data > 90 hari)
-- ============================================================
CREATE MATERIALIZED VIEW telemetry_daily
WITH (timescaledb.continuous) AS
SELECT
    lamp_id,
    time_bucket('1 day', time) AS day,
    -- Electrical
    AVG(voltage)              AS avg_voltage,
    AVG(current)              AS avg_current,
    AVG(power)                AS avg_power,
    SUM(energy)               AS total_energy_consumed,
    -- Solar
    AVG(solar_power)          AS avg_solar_power,
    MAX(solar_energy_today)   AS total_solar_generated,
    -- Battery
    AVG(battery_level)        AS avg_battery_level,
    MIN(battery_level)        AS min_battery_level,
    MAX(battery_level)        AS max_battery_level,
    -- Environment
    AVG(temperature_internal) AS avg_temp_internal,
    AVG(temperature_ambient)  AS avg_temp_ambient,
    AVG(lux)                  AS avg_lux,
    SUM(motion_count)         AS total_motion_events,
    -- Control
    AVG(brightness)           AS avg_brightness,
    -- Stats
    COUNT(*)                  AS sample_count,
    MIN(voltage)              AS min_voltage,
    MAX(voltage)              AS max_voltage
FROM telemetry
GROUP BY lamp_id, day;

SELECT add_retention_policy('telemetry_daily', INTERVAL '2 years');

-- ============================================================
-- PREDICTIONS (output ML)
-- ============================================================
CREATE TABLE predictions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_id              UUID REFERENCES lamps(id),
    predicted_at         TIMESTAMPTZ DEFAULT NOW(),
    failure_probability  DECIMAL(5,3),
    days_to_failure      INTEGER,
    risk_level           VARCHAR(20),
    recommendation       TEXT,
    model_version        VARCHAR(50),
    confidence           DECIMAL(5,3)
);
CREATE INDEX idx_predictions_lamp ON predictions(lamp_id, predicted_at DESC);

-- ============================================================
-- ML MODEL REGISTRY
-- ============================================================
CREATE TABLE ml_models (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version          VARCHAR(50) UNIQUE NOT NULL,
    file_path        VARCHAR(500),
    accuracy         DECIMAL(5,3),
    training_samples INTEGER,
    trained_at       TIMESTAMPTZ,
    is_active        BOOLEAN DEFAULT FALSE,
    trained_by       VARCHAR(50),    -- 'scheduled' | 'manual'
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE alerts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_id      UUID REFERENCES lamps(id),
    threshold_id UUID REFERENCES alert_thresholds(id),
    alert_type   VARCHAR(100),
    severity     VARCHAR(20),        -- 'critical' | 'warning' | 'info'
    message      TEXT,
    metric_value DECIMAL(10,3),
    is_resolved  BOOLEAN DEFAULT FALSE,
    resolved_by  UUID REFERENCES users(id),
    resolved_at  TIMESTAMPTZ,
    resolve_note TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alerts_lamp ON alerts(lamp_id, created_at DESC);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = FALSE;

-- ============================================================
-- REPAIR TICKETS
-- ============================================================
CREATE TABLE repair_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lamp_id         UUID NOT NULL REFERENCES lamps(id),
    alert_id        UUID REFERENCES alerts(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) DEFAULT 'open',
    -- 'open' | 'in_progress' | 'resolved' | 'cancelled'
    priority        VARCHAR(20) DEFAULT 'medium',
    -- 'low' | 'medium' | 'high' | 'critical'
    assigned_to     UUID REFERENCES users(id),
    created_by      UUID REFERENCES users(id),
    started_at      TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,
    resolution_note TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_logs (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   UUID REFERENCES repair_tickets(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100),
    note        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Foto lampiran tiket (terpisah agar bisa multiple per tiket)
CREATE TABLE ticket_attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255),
    mime_type   VARCHAR(50),    -- 'image/jpeg' | 'image/png' | 'image/webp'
    file_size   INTEGER,        -- bytes
    uploaded_by UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================================
-- REPORT JOBS
-- ============================================================
CREATE TABLE report_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type     VARCHAR(50) NOT NULL,
    -- 'lamp_status' | 'alerts' | 'maintenance' | 'energy' | 'sustainability'
    requested_by    UUID REFERENCES users(id),
    filters         JSONB,
    output_format   VARCHAR(10),    -- 'excel' | 'pdf'
    status          VARCHAR(20) DEFAULT 'pending',
    -- 'pending' | 'processing' | 'done' | 'failed'
    file_path       VARCHAR(500),
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

-- ============================================================
-- ENERGY COST CONFIG (untuk kalkulasi cost comparison)
-- ============================================================
CREATE TABLE energy_cost_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,      -- e.g. 'Tarif PLN 2025'
    electricity_rate DECIMAL(10,2) NOT NULL,    -- Rp per kWh (atau USD)
    currency        VARCHAR(10) DEFAULT 'IDR',
    traditional_lamp_watt DECIMAL(10,2),        -- Watt lampu konvensional pembanding
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default config
INSERT INTO energy_cost_config (name, electricity_rate, currency, traditional_lamp_watt)
VALUES ('Tarif PLN Default', 1444.70, 'IDR', 150.0);
```

---

## 4. ALUR REGISTRASI & PERSETUJUAN ADMIN

### State Machine Status User

```
[Form Daftar]
      ↓
  status: PENDING
  email_verified: false
      ↓
  [Klik link verifikasi di email — expired 24 jam]
      ↓
  status: AWAITING_APPROVAL
  email_verified: true
  → Notifikasi in-app + email ke semua admin
      ↓
  ┌──────────────────────────────┐
  │  Admin review di dashboard   │
  │  Tab "Antrian Persetujuan"   │
  └──────────────────────────────┘
       ↓                   ↓
  [Approve]           [Reject + alasan]
       ↓                   ↓
  status: ACTIVE      status: REJECTED
  → Email notif       → Email notif + alasan
       ↓
  [Bisa login]

  Kapan saja admin bisa: ACTIVE ↔ SUSPENDED
```

### Detail Tiap Step

**Step 1 — Daftar**
- Field: nama lengkap, email, password (min 8 karakter), konfirmasi password
- Role otomatis: `operator` — tidak bisa memilih admin
- Cek email sudah terdaftar → 409 Conflict
- Generate token UUID, simpan di `auth_tokens` (type: `email_verify`, expired 24 jam)
- Kirim email verifikasi (Celery async task)
- Rate limit: max 5 register per IP per jam

**Step 2 — Verifikasi Email**
- `GET /auth/verify-email?token=<uuid>`
- Validasi: token ada, belum expired, belum dipakai
- Set `email_verified = true`, `status = 'awaiting_approval'`
- Kirim notifikasi in-app + email ke semua admin

**Step 3 — Admin Approve / Reject**
- `PATCH /admin/users/{id}/approval`
- Body: `{ "action": "approve" | "reject", "reason": "..." }`
- Catat di `audit_logs`

**Step 4 — Login**
- `pending` → "Silakan verifikasi email Anda"
- `awaiting_approval` → "Menunggu persetujuan admin"
- `rejected` → "Akun ditolak. Alasan: {reason}"
- `suspended` → "Akun ditangguhkan. Hubungi admin"
- `active` → generate access token + refresh token

---

## 5. STRATEGI AUTH & KEAMANAN TOKEN

### Skema Token (Anti-XSS & Anti-CSRF)

```
Access Token:
  - Disimpan di memori JavaScript (bukan localStorage)
  - Dikirim via header: Authorization: Bearer <token>
  - Expired: 30 menit

Refresh Token:
  - Disimpan di HttpOnly cookie (tidak bisa diakses JS)
  - Signed dengan itsdangerous (anti-tamper)
  - Expired: 7 hari
  - Path: /auth/refresh
  - SameSite: Strict (anti-CSRF otomatis)
  - Disimpan juga di tabel auth_tokens untuk revocation
```

### Mengapa Kombinasi Ini Aman
- **Anti-XSS**: Access token hanya di memori JS, refresh token di HttpOnly cookie
- **Anti-CSRF**: SameSite=Strict → browser tidak kirim cookie pada cross-site request
- Tidak perlu CSRF token tambahan

### WebSocket Authentication
WebSocket tidak bisa kirim header Authorization. Solusi: one-time WS ticket.

```python
# 1. Client minta ticket sebelum connect WebSocket
GET /ws/ticket
Response: { "ticket": "abc123", "expires_in": 30 }
# Ticket disimpan di Redis, expired 30 detik

# 2. Client connect WebSocket dengan ticket di query param
WS /ws/dashboard?ticket=abc123
# Backend validasi ticket di Redis → hapus setelah dipakai (single-use)
```

### Flow Refresh Token
```
Access token expired → POST /auth/refresh (HttpOnly cookie dikirim otomatis)
→ Backend validasi: ada di DB, tidak revoked, belum expired
→ Generate access token baru + refresh token baru (rotation)
→ Revoke refresh token lama
→ Response: access token baru di body, refresh token baru di cookie
```

### Revoke Token
- Logout: revoke refresh token aktif
- Ganti password: revoke SEMUA refresh token aktif user

### Validasi Koordinat GPS (Indonesia)
```python
@field_validator('latitude')
def validate_lat(cls, v):
    if not (-11.0 <= v <= 6.0):
        raise ValueError('Latitude di luar wilayah Indonesia')
    return v

@field_validator('longitude')
def validate_lon(cls, v):
    if not (95.0 <= v <= 141.0):
        raise ValueError('Longitude di luar wilayah Indonesia')
    return v
```

### Validasi Upload File (Magic Bytes)
```python
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
MAX_AVATAR_SIZE = 2 * 1024 * 1024        # 2MB foto profil
MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024   # 10MB foto lampiran tiket

async def validate_image_upload(file: UploadFile, max_size: int):
    content = await file.read(2048)
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Tipe file tidak diizinkan: {mime}")
    await file.seek(0)
    full_content = await file.read()
    if len(full_content) > max_size:
        raise HTTPException(400, f"Ukuran file melebihi batas")
    return full_content
```

### Deduplikasi Data MQTT
```python
async def handle_telemetry(lamp_code: str, payload: dict):
    # Cek duplikat: kombinasi lamp_id + timestamp harus unik
    key = f"dedup:{lamp_code}:{payload['timestamp']}"
    if await redis.exists(key):
        return  # Abaikan data duplikat
    await redis.setex(key, 300, "1")  # TTL 5 menit
    # Lanjut proses...
```

---

## 6. ROLE & PERMISSION

### Matriks Permission

| Fitur | Admin | Operator |
|---|---|---|
| **USER MANAGEMENT** | | |
| Lihat daftar user | ✅ | ❌ |
| Approve / reject / suspend user | ✅ | ❌ |
| Edit profil user lain | ✅ | ❌ |
| Lihat audit log | ✅ | ❌ |
| **PROFIL SENDIRI** | | |
| Edit profil + ganti password + upload avatar | ✅ | ✅ |
| **PLACE MANAGEMENT** | | |
| Lihat semua tempat | ✅ | ✅ |
| Tambah / edit / hapus tempat | ✅ | ❌ |
| **LAMP MANAGEMENT** | | |
| Lihat semua lampu | ✅ | ✅ |
| Tambah / edit / hapus lampu | ✅ | ❌ |
| Update status ke maintenance | ✅ | ✅ |
| Set brightness manual | ✅ | ✅ |
| Konfigurasi jadwal lampu | ✅ | ❌ |
| Trigger OTA firmware update | ✅ | ❌ |
| **REPAIR TICKETS** | | |
| Lihat / buat / update tiket | ✅ | ✅ |
| Upload foto lampiran tiket | ✅ | ✅ |
| Hapus tiket | ✅ | ❌ |
| **MONITORING** | | |
| Dashboard, map, grafik, ML, alert resolve | ✅ | ✅ |
| Energy & Sustainability Dashboard | ✅ | ✅ |
| **LAPORAN** | | |
| Generate & export laporan | ✅ | ✅ |
| **SETTINGS** | | |
| Konfigurasi threshold alert | ✅ | ❌ |
| Konfigurasi energy cost (tarif) | ✅ | ❌ |
| Lihat riwayat ML model | ✅ | ❌ |
| Trigger ML training manual | ✅ | ❌ |
| Manajemen firmware OTA | ✅ | ❌ |

---

## 7. HALAMAN & FITUR LENGKAP

---

### A. LANDING PAGE (Publik)

Sections (sesuai frontend):
- **Hero** — tagline + CTA "Daftar Sekarang" & "Login"
- **Stats** — 12,500+ Lamps Deployed | 98.7% Uptime | 45% Energy Saved | 200+ Cities
- **Exploded View** — diagram interaktif komponen lampu (LED Head, Solar Panel, LiFePO4 Battery, ESP32 Controller)
- **Features** — IoT Monitoring | Solar Powered | Auto Dimming | Remote Control | Smart Scheduling | Weather Adaptive
- **IoT Monitoring Showcase** — demo live telemetry widget
- **Sensor Analytics** — demo chart lux, suhu, motion
- **Energy Efficiency** — demo perbandingan generated vs consumed + CO₂
- **Dashboard Preview** — screenshot tabel network status
- **Certification badges** — ISO 14001 | IEC 62717 | CE | UL Listed
- **FAQ | Contact | About | Footer**

UX Detail:
- SEO metadata lengkap
- Responsive mobile, dark mode support
- Animasi scroll reveal per section

---

### B. HALAMAN AUTH

**B1. Login** — email, password, error spesifik per status akun
**B2. Register** — nama, email, password, konfirmasi (role otomatis operator, rate limit 5x/jam)
**B3. Cek Email** — info link dikirim + tombol kirim ulang (cooldown 60 detik)
**B4. Verifikasi Berhasil** — redirect ke login
**B5. Menunggu Persetujuan** — tampil saat status `awaiting_approval`
**B6. Lupa & Reset Password** — link expired 1 jam, notifikasi email setelah reset

---

### C. PROFIL USER

Halaman `/profile`

- Foto profil (upload magic bytes, max 2MB, auto-resize Pillow)
- Nama, Email (read-only), Nomor HP, Role, Status, Tanggal bergabung
- Form ganti password (validasi password lama → revoke semua refresh token → email notif)

---

### D. NOTIFIKASI IN-APP

Bell icon navbar + badge count unread. Dropdown max 10 terbaru, realtime via WebSocket.

| Event | Penerima |
|---|---|
| User baru menunggu persetujuan | Semua admin |
| Akun disetujui / ditolak / suspended | User bersangkutan |
| Lampu fault / alert critical | Semua admin + operator |
| Baterai kritis (< 15%) | Semua admin + operator |
| Maintenance due (ML < 7 hari) | Semua admin + operator |
| Tiket baru / selesai | Admin + operator terkait |
| OTA selesai / gagal | Admin yang trigger |
| Password diubah | User bersangkutan |

---

### E. DARK MODE

- Toggle di navbar (simpan di localStorage, default ikuti OS)
- Tailwind `dark:` variant di semua komponen
- Recharts: ganti tema berdasarkan state `isDark`
- Leaflet: CartoDB Dark Matter saat dark mode

```typescript
const tileUrl = isDark
  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
```

---

### F. HALAMAN ERROR

- **404** — `app/not-found.tsx`
- **403** — `app/forbidden/page.tsx`
- **500** — `app/error.tsx`

Fetch interceptor:
```typescript
if (status === 401) → tryRefreshToken() → retry atau redirect /login
if (status === 403) → redirect /forbidden
if (status >= 500) → redirect /error
```

---

### G. LOADING & SKELETON STATE

| Komponen | Skeleton |
|---|---|
| KPI cards | Rectangle shimmer |
| Tabel lampu/tempat | 10 baris shimmer |
| Chart | Area abu-abu animate-pulse |
| Detail lampu | Card shimmer per section |
| Sensor analytics | 3 chart shimmer berjajar |
| Energy dashboard | Card + bar shimmer |
| Notifikasi dropdown | 5 baris shimmer |

---

### H. SEARCH GLOBAL (Ctrl+K)

Debounce 300ms, hasil dikelompokkan: Lampu | Tempat | Tiket

---

### I. BREADCRUMB NAVIGASI

Semua halaman dalam (bukan landing/auth). Implementasi via `usePathname()`.

---

### J. DASHBOARD HOME

KPI Cards (realtime WebSocket, 8 metrik):
- Total Lampu | Online | Offline | Fault | Alert Hari Ini | Avg Health Score | Avg Battery | Solar Status (Charging/Idle/Night)

System Status Map Preview + Performance Trend Chart (uptime % 7/30 hari)

Predictive Maintenance Summary: High Risk | Medium Risk | Safe

Energy Summary Strip: Total Solar Generated Hari Ini | Total Consumed | Efisiensi Sistem

Banner approval pending (Admin)

---

### K. DASHBOARD USER MANAGEMENT (Admin only)

Tab 1: User Aktif — Nama | Email | Role | Status | Login Terakhir | Aksi [Edit Role] [Suspend] [Hapus]
Tab 2: Antrian Persetujuan (badge count) — [✅ Setujui] [❌ Tolak + alasan]
Tab 3: Tersuspensi / Ditolak — [Aktifkan Kembali]

---

### L. AUDIT LOG (Admin only)

Halaman `/admin/audit-log`

Tabel: Waktu | User | Aksi | Entitas | Detail | IP
Filter: tanggal range, user, jenis aksi
Contoh aksi baru: `lamp.brightness_set` | `lamp.schedule_set` | `lamp.ota_trigger` | `lamp.ota_cancel`
Export: Excel / CSV

---

### M. SETTINGS (Admin only)

Halaman `/admin/settings`

**Tab: Alert Threshold**
Metrik yang bisa dikonfigurasi: voltage (rendah/tinggi) | current | temperature_internal | temperature_ambient | battery_level | offline_minutes | signal_strength
Form: nama, metrik, kondisi (lt/gt), nilai warning, nilai critical

**Tab: ML Model**
Riwayat model: versi | akurasi | jumlah data | tanggal | trigger | status aktif
Tombol [Training Manual]

**Tab: Tarif Energi**
Form konfigurasi energy cost: nama tarif, harga per kWh, mata uang, watt lampu konvensional pembanding
Digunakan untuk kalkulasi cost comparison di Energy Dashboard

**Tab: Firmware OTA**
Daftar versi firmware tersedia: versi | changelog | tanggal upload | ukuran file
Form upload firmware baru (.bin)
Tombol [Deploy ke Lampu...] → pilih lampu target → trigger OTA

---

### N. DETAIL TEMPAT

Halaman `/places/{id}`

1. Info: nama, tipe, parent area, koordinat, deskripsi
2. Mini map posisi tempat
3. Summary cards: Total Lampu | Online | Fault | High Risk | Avg Battery | Avg Solar Power
4. Chart pie status lampu
5. Tabel lampu (Kode | Status | Battery % | Brightness % | Health | Risk | Update)
6. Riwayat alert area (5 terbaru)
7. Tombol [Lihat di Map] [Edit]* [Hapus]* (*Admin only)

---

### O. DASHBOARD DAFTAR TEMPAT

Summary: Total | Sehat | Warning | Kritis
Tabel: Nama | Tipe | Total Lampu | Online | Fault | Avg Battery | Risk | Aksi
Filter: nama, tipe, status, risk
Toggle: Tabel / Map

---

### P. DASHBOARD DAFTAR LAMPU

Summary bar: Total | Online | Fault | Avg Battery | Charging

Tabel: Kode | Lokasi | Status | Battery % | Brightness % | Health | Risk | Update | Aksi
Status badge: 🟢 Online | 🟡 Warning | 🔴 Fault | 🔵 Maintenance | ⚫ Offline

Filter: search, status, risk, tempat, tanggal (filter berdasarkan `last_seen` dan `installed_at`)
Bulk actions (Admin): assign tempat, set maintenance, export, hapus
Pagination: server-side, 25/50/100 per halaman

---

### Q. DETAIL LAMPU

Halaman `/lamps/{id}`

**Section 1 — Info Umum**
Kode, lokasi, model, power rating, panel Wp, kapasitas baterai Wh, firmware version, tanggal pasang

**Section 2 — Status Real-time**
Status badge + last seen + uptime + `ml_ready` indicator
Live metrics (WebSocket): Battery %, Solar Input W, Power Output W, Temperature °C, Signal %, Brightness %

**Section 3 — Mini Map**
Posisi lampu + marker

**Section 4 — System Telemetry (24 jam)**
Chart: Voltage | Current | Power | Energy (consumed vs solar generated)
Chart: Battery Level (%) trend
Chart: Signal Strength + MQTT Latency

**Section 5 — Sensor Analytics**
Chart 24 jam: Light Intensity (lux) | Temperature (ambient vs internal) | Motion Events
Badge metrics: Avg Lux | Avg Temp Ambient | Total Motion Events | Avg Brightness

**Section 6 — Prediksi ML**
- Jika `ml_ready = false`: banner "Data belum cukup. Butuh minimal 48 data (±4 hari)."
- Jika `ml_ready = true`: Risk level badge | Failure probability % | Days to failure | Rekomendasi

**Section 7 — Kontrol Lampu** (membutuhkan konfirmasi)
- Slider brightness (0–100%) + tombol [Terapkan] → kirim MQTT command → catat audit log
- Tombol [Lihat Jadwal] → link ke halaman schedule

**Section 8 — Riwayat Alert & Tiket**
5 alert terbaru + link ke halaman alert
5 tiket terbaru + link ke halaman tiket

**Section 9 — Device Log**
Log event dari firmware: reboot, OTA, sensor error, wifi reconnect (max 20 terbaru)

**Section 10 — OTA Firmware** (Admin only)
Status firmware aktif + tombol [Update Firmware] → pilih versi → konfirmasi

**Tombol Aksi:**
[Buat Tiket] [Set Maintenance] | [Konfigurasi Jadwal]* [Edit]* [Hapus]* (*Admin only)

---

### R. KONFIGURASI JADWAL LAMPU (Admin only)

Halaman `/lamps/{id}/schedule`

Form jadwal:
- Nama jadwal
- Mode: Auto (sunrise/sunset berdasarkan koordinat GPS) atau Manual (input jam on/off)
- Dimming schedule builder: tabel jam → brightness (draggable atau form input)
  - Contoh: 18:00–22:00 = 100%, 22:00–04:00 = 50%, 04:00–06:00 = 100%
- Tombol [Simpan & Kirim ke Perangkat] → publish MQTT command schedule

Preview visual: timeline 24 jam dengan blok brightness berwarna

---

### S. MAP LAMPU

Marker SVG custom per status: 🟢 Online | 🟡 Warning | 🔴 Fault | 🔵 Maintenance | ⚪ Offline
Clustering wajib > 500 lampu
Popup: ID | Status | Battery % | Brightness % | Solar Input | Health | Risk | [Detail] [Buat Tiket]
Filter sidebar: status, risk, area, battery range, tanggal
Search: lamp ID → zoom otomatis
Summary bar: Total | Online | Fault | Avg Battery | Charging
Layer toggle: Street / Satellite / Dark
Realtime WebSocket update

---

### T. DASHBOARD MONITORING

```
[KPI Cards — realtime WebSocket]
[Trend Chart (24h/7d/30d)] | [Risk Summary ML]
[Lamp/Place Selector]       | [Recommendation Panel]
[Detail Charts — Telemetry + Sensor]
[Data Table — exportable langsung tanpa Celery]
```

KPI: Online | Fault | Warning | High Risk | Avg Voltage | Avg Battery | Uptime %

Detail charts:
- Electrical: Voltage, Current, Power
- Energy: Solar Generated vs Consumed (area chart)
- Battery: Level trend
- Sensors: Lux, Temperature (internal vs ambient), Motion Events
- ML: Health Score, Anomaly Score, Failure Probability

Data table: export Excel/CSV langsung (endpoint `GET /monitoring/telemetry/export`) — tidak pakai Celery, langsung stream response

---

### U. ENERGY & SUSTAINABILITY DASHBOARD

Halaman `/energy`

**Daily Performance Panel**
- Solar Generated (Wh) | Consumed (Wh) | Net Balance (Wh)
- CO₂ Saved (kg) — kalkulasi: `(energy_saved_kwh × 0.87 kg/kWh)`
- Tree Equivalent — kalkulasi: `(co2_saved / 21.7 kg/tree/year)`
- System Efficiency Rating % = `(consumed / solar_generated × 100)`

**Energy Flow Chart (24 jam)**
- Area chart: Solar Generated (hijau) vs Consumed (biru)
- Realtime dari WebSocket

**Cost Comparison Panel**
Menggunakan konfigurasi tarif dari `energy_cost_config`:
- Monthly Cost: Traditional (Rp/bulan) vs Smart Solar (Rp/bulan)
- Energy Consumption: Traditional (kWh) vs Smart Solar (kWh)
- CO₂ Emissions: Traditional (kg/bulan) vs Smart Solar (0)
- Total Cost Savings %

Rumus:
```
traditional_monthly_cost = (traditional_lamp_watt × hours_on × 30) / 1000 × electricity_rate × lamp_count
smart_monthly_cost = maintenance_cost_estimate (sangat kecil, bisa 0 atau konstanta)
savings_pct = (traditional - smart) / traditional × 100
```

**Environmental Impact Tracker**
- Kumulatif CO₂ saved sejak sistem aktif
- Kumulatif kWh generated dari solar
- Bar chart perbandingan per area/tempat

**Filter**: rentang tanggal | area/tempat | per lampu

---

### V. REPAIR TICKETS

Halaman `/tickets`

Summary: Total | Open | In Progress | Resolved
Tabel: ID | Lampu | Lokasi | Prioritas | Status | Di-assign | Dibuat | Aksi
Buat tiket: pilih lampu (autocomplete), judul, deskripsi, prioritas, assign
Detail `/tickets/{id}`:
- Timeline log aksi
- Form update status + catatan
- Upload foto lampiran (max 10MB per file, max 5 foto, magic bytes validation)
- Galeri foto lampiran yang sudah diupload
Tombol: [Mulai] [Selesaikan] [Batalkan]

---

### W. LAPORAN

Halaman `/reports`

5 jenis laporan:
- Kondisi Lampu
- Alert
- Prediksi Maintenance
- Konsumsi Energi
- **Sustainability & CO₂ Impact** (baru)

Form: jenis, rentang tanggal, filter tempat, format Excel/PDF
Generate async via Celery → polling → download
Riwayat laporan: tabel + download ulang

---

## 8. API ENDPOINT LENGKAP

### Auth
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/verify-email          # ?token=<uuid>
POST   /auth/resend-verification
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /ws/ticket                  # Minta one-time ticket untuk WebSocket
```

### Profil User
```
GET    /users/me
PUT    /users/me
POST   /users/me/change-password
POST   /users/me/avatar
```

### Search Global
```
GET    /search?q=<query>&limit=10
```

### User Management (Admin only)
```
GET    /admin/users
GET    /admin/users/pending
PATCH  /admin/users/{id}/approval
PATCH  /admin/users/{id}/role
PATCH  /admin/users/{id}/suspend
DELETE /admin/users/{id}
GET    /admin/audit-logs
```

### Notifications
```
GET    /notifications
PATCH  /notifications/read-all
PATCH  /notifications/{id}/read
```

### Settings (Admin only)
```
GET    /admin/settings/thresholds
POST   /admin/settings/thresholds
PUT    /admin/settings/thresholds/{id}
PATCH  /admin/settings/thresholds/{id}
GET    /admin/settings/ml-models
POST   /admin/settings/ml-train
GET    /admin/settings/energy-cost
PUT    /admin/settings/energy-cost/{id}
GET    /admin/settings/firmware              # Daftar versi firmware
POST   /admin/settings/firmware             # Upload firmware baru (Admin only)
DELETE /admin/settings/firmware/{id}
```

### Places
```
GET    /places
POST   /places                              # Admin only
GET    /places/{id}
PUT    /places/{id}                         # Admin only
DELETE /places/{id}                         # Admin only
GET    /places/{id}/lamps
```

### Lamps
```
GET    /lamps
POST   /lamps                               # Admin only
GET    /lamps/{id}
PUT    /lamps/{id}                          # Admin only
DELETE /lamps/{id}                          # Admin only
PATCH  /lamps/{id}/status                   # Admin + Operator
PATCH  /lamps/{id}/brightness               # Admin + Operator (publish MQTT)
GET    /lamps/{id}/telemetry                # ?start=&end=&fields= (raw vs agregat otomatis)
GET    /lamps/{id}/predictions
GET    /lamps/{id}/alerts
GET    /lamps/{id}/tickets
GET    /lamps/{id}/device-logs
GET    /lamps/{id}/schedule
POST   /lamps/{id}/schedule                 # Admin only (simpan + publish MQTT)
PUT    /lamps/{id}/schedule/{schedule_id}   # Admin only
GET    /lamps/{id}/ota
POST   /lamps/{id}/ota                      # Admin only (trigger OTA)
```

### Monitoring
```
GET    /monitoring/kpi
GET    /monitoring/trend
GET    /monitoring/risk-summary
GET    /monitoring/telemetry
GET    /monitoring/telemetry/export         # Download langsung Excel/CSV (stream)
```

### Energy & Sustainability
```
GET    /energy/summary                      # Daily performance + CO₂ + efficiency
GET    /energy/flow                         # Solar generated vs consumed (chart data)
GET    /energy/cost-comparison              # Traditional vs smart solar kalkulasi
GET    /energy/impact                       # Kumulatif CO₂, kWh, per area
```

### Alerts
```
GET    /alerts
GET    /alerts/{id}
PATCH  /alerts/{id}/resolve
```

### Repair Tickets
```
GET    /tickets
POST   /tickets
GET    /tickets/{id}
PUT    /tickets/{id}
PATCH  /tickets/{id}/status
DELETE /tickets/{id}                        # Admin only
POST   /tickets/{id}/logs
POST   /tickets/{id}/attachments            # Upload foto lampiran
GET    /tickets/{id}/attachments
DELETE /tickets/{id}/attachments/{att_id}
```

### Reports
```
POST   /reports/generate
GET    /reports/status/{job_id}
GET    /reports/{id}/download
GET    /reports/history
```

### Health Check
```
GET    /health
```

### WebSocket
```
WS     /ws/dashboard?ticket=<token>         # KPI + notifikasi realtime
WS     /ws/map?ticket=<token>               # Update marker peta realtime
WS     /ws/lamp/{id}?ticket=<token>         # Telemetry realtime detail lampu
```

---

## 9. FORMAT DATA MQTT (IoT)

### Topic Convention
```
# Subscribe (backend ← device)
pju/{place_id}/{lamp_code}/telemetry
pju/{place_id}/{lamp_code}/heartbeat
pju/{place_id}/{lamp_code}/device-log
pju/{place_id}/{lamp_code}/ota-status       # Status update OTA dari device

# Publish (backend → device)
pju/{place_id}/{lamp_code}/cmd/brightness   # Set brightness
pju/{place_id}/{lamp_code}/cmd/schedule     # Set jadwal
pju/{place_id}/{lamp_code}/cmd/ota          # Trigger OTA
```

### Payload Telemetry (ESP32 → Backend)
```json
{
  "lamp_code": "SL-001",
  "timestamp": "2025-01-15T22:00:00Z",
  "voltage": 220.5,
  "current": 0.45,
  "power": 99.2,
  "energy": 0.099,
  "solar_voltage": 18.2,
  "solar_current": 2.3,
  "solar_power": 41.9,
  "solar_energy_today": 480.0,
  "battery_level": 87.0,
  "battery_voltage": 13.2,
  "battery_current": 1.5,
  "temperature_internal": 42.3,
  "temperature_ambient": 32.4,
  "lux": 892.0,
  "motion_count": 3,
  "signal_strength": 92.0,
  "mqtt_latency_ms": 45,
  "brightness": 80.0,
  "firmware": "v1.2.3",
  "uptime_seconds": 86400
}
```

### Payload Heartbeat
```json
{
  "lamp_code": "SL-001",
  "timestamp": "2025-01-15T22:00:00Z",
  "uptime_seconds": 86400,
  "battery_level": 87.0,
  "signal_strength": 92.0
}
```

### Payload Device Log (Device → Backend)
```json
{
  "lamp_code": "SL-001",
  "timestamp": "2025-01-15T22:00:00Z",
  "log_level": "warn",
  "event_code": "battery_critical",
  "message": "Battery level dropped to 14%"
}
```

### Payload OTA Status (Device → Backend)
```json
{
  "lamp_code": "SL-001",
  "timestamp": "2025-01-15T22:00:00Z",
  "ota_job_id": "uuid-xxx",
  "status": "success",
  "new_firmware": "v1.3.0",
  "message": "OTA completed successfully"
}
```

### Command Brightness (Backend → Device)
```json
{
  "brightness": 50.0,
  "issued_by": "operator@pju.id",
  "timestamp": "2025-01-15T22:00:00Z"
}
```

### Command Schedule (Backend → Device)
```json
{
  "auto_sunrise": true,
  "auto_sunset": true,
  "dimming_schedule": [
    {"hour": 18, "minute": 0, "brightness": 100},
    {"hour": 22, "minute": 0, "brightness": 50},
    {"hour": 4,  "minute": 0, "brightness": 100}
  ],
  "timestamp": "2025-01-15T22:00:00Z"
}
```

### Command OTA (Backend → Device)
```json
{
  "ota_job_id": "uuid-xxx",
  "firmware_url": "https://firmware.pju.id/v1.3.0.bin",
  "firmware_version": "v1.3.0",
  "checksum_sha256": "abc123...",
  "timestamp": "2025-01-15T22:00:00Z"
}
```

### Interval Pengiriman
- Telemetry: setiap 5 menit (normal), 30 detik (saat anomali terdeteksi di device)
- Heartbeat: setiap 1 menit

### Backend Handler
```python
async def handle_telemetry(lamp_code: str, payload: dict):
    # 0. Cek duplikat via Redis (dedup key: lamp_code + timestamp)
    # 1. Hitung anomaly_score di backend (rule-based atau ML inference ringan)
    # 2. Simpan ke tabel telemetry
    # 3. Update lamps: last_seen, status, telemetry_count++
    #    last_battery_level, last_brightness, last_signal_strength
    # 4. Jika telemetry_count >= 48: set ml_ready = true
    # 5. Cek semua threshold aktif → trigger alert jika lewat batas
    #    Termasuk: battery_level, temperature_ambient, signal_strength
    # 6. Broadcast ke /ws/map + /ws/dashboard via Redis pub/sub
    # 7. Jika anomaly_score > 0.7 dan ml_ready: queue ML prediction
```

### Definisi Anomaly Score
- Dihitung backend saat insert, bukan oleh device
- Algoritma: rule-based scoring berdasarkan deviasi metrik dari rata-rata 7 hari terakhir
- Range: 0.0 (normal) – 1.0 (sangat anomali)
- Formula sederhana:
  ```python
  score = weighted_avg([
      deviation(voltage, avg_voltage_7d),       # weight 0.3
      deviation(current, avg_current_7d),        # weight 0.2
      deviation(temperature_internal, avg_temp), # weight 0.2
      deviation(battery_level, expected_battery),# weight 0.2
      deviation(solar_power, expected_solar),    # weight 0.1
  ])
  # deviation = abs(value - avg) / std_dev, clipped ke 0-1
  ```

---

## 10. BACKGROUND JOBS & OFFLINE DETECTION

### Celery Tasks

```python
@celery.task
def check_offline_lamps():
    """Setiap 5 menit."""
    threshold_minutes = get_active_threshold('offline_minutes').warning_value
    cutoff = datetime.now(UTC) - timedelta(minutes=threshold_minutes)
    lamps = db.query(Lamp).filter(
        Lamp.last_seen < cutoff,
        Lamp.status.notin_(['offline', 'maintenance']),
        Lamp.is_deleted == False
    ).all()
    for lamp in lamps:
        lamp.status = 'offline'
        create_alert_if_not_exists(lamp, 'lamp_offline', 'warning')
        publish_ws_map_update(lamp)

@celery.task
def run_ml_prediction(lamp_id: str):
    """On-demand atau terjadwal harian."""
    lamp = db.get(Lamp, lamp_id)
    if not lamp.ml_ready:
        return
    model = load_active_model()
    features = get_lamp_features(lamp_id)   # Termasuk battery, lux, temp_ambient
    result = model.predict(features)
    save_prediction(lamp_id, result)
    update_lamp_risk_level(lamp, result)

@celery.task
def process_ota_status(lamp_code: str, payload: dict):
    """Handle update status OTA dari device via MQTT."""
    job = db.query(OtaJob).filter_by(lamp_id=..., status='sent').first()
    job.status = payload['status']       # 'success' | 'failed'
    job.completed_at = NOW()
    if payload['status'] == 'success':
        lamp.firmware_version = payload['new_firmware']
        notify_admin(f"OTA {lamp_code} berhasil ke {payload['new_firmware']}")
    else:
        notify_admin(f"OTA {lamp_code} GAGAL: {payload['message']}", severity='critical')

@celery.task
def send_email(template: str, to: str, context: dict): ...

@celery.task
def generate_report_file(job_id: str): ...

@celery.task
def run_database_backup(): ...
```

### Celery Beat Schedule
```python
CELERYBEAT_SCHEDULE = {
    'check-offline': {
        'task': 'tasks.lamp_tasks.check_offline_lamps',
        'schedule': crontab(minute='*/5'),
    },
    'daily-ml': {
        'task': 'tasks.ml_tasks.run_daily_ml_all_lamps',
        'schedule': crontab(hour=2, minute=0),
    },
    'weekly-ml-training': {
        'task': 'tasks.ml_tasks.retrain_model_if_better',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),
    },
    'aggregate-telemetry': {
        'task': 'tasks.telemetry_tasks.refresh_daily_aggregate',
        'schedule': crontab(hour=3, minute=30),
    },
    'daily-backup': {
        'task': 'tasks.backup_tasks.run_database_backup',
        'schedule': crontab(hour=1, minute=0),
    },
}
```

### Health Check
```python
@router.get("/health")
async def health_check(db = Depends(get_db), redis = Depends(get_redis)):
    checks = {}
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"
    try:
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        checks["redis"] = f"error: {e}"
    checks["mqtt"] = "ok" if mqtt_service.is_connected() else "disconnected"
    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": status, "services": checks, "timestamp": datetime.now(UTC)}
```

---

## 11. ML — TRAINING & HANDLING DATA BARU

### Minimum Data: 48 telemetry (≈4 hari)

```python
lamp.telemetry_count += 1
if lamp.telemetry_count >= 48 and not lamp.ml_ready:
    lamp.ml_ready = True
    run_ml_prediction.delay(str(lamp.id))
```

### Feature Set ML
Input model mencakup (semua dinormalisasi):
- `avg_voltage_7d`, `std_voltage_7d`
- `avg_current_7d`, `std_current_7d`
- `avg_power_7d`
- `avg_battery_level_7d`, `min_battery_level_7d`
- `avg_temperature_internal_7d`, `max_temperature_internal_7d`
- `avg_temperature_ambient_7d`
- `avg_lux_7d`
- `avg_solar_power_7d`
- `avg_anomaly_score_7d`
- `telemetry_count` (sebagai proxy age/maturity)

### Alur Training Ulang
```
Otomatis (Minggu jam 03:00 via Celery Beat):
  Ambil telemetry + label historis dari DB
  Train model baru (XGBoost)
  Evaluasi akurasi vs model aktif
  Jika lebih baik → is_active = true, notifikasi admin
  Simpan metadata ke ml_models

Manual (Admin trigger via POST /admin/settings/ml-train):
  Queue task training → notifikasi in-app saat selesai
```

---

## 12. AGREGASI TELEMETRY JANGKA PANJANG

### TimescaleDB Continuous Aggregate

```sql
-- Sudah mencakup semua field baru (solar, battery, lux, motion, brightness)
-- Lihat definisi lengkap di Bagian 3 (telemetry_daily)

SELECT add_continuous_aggregate_policy('telemetry_daily',
    start_offset => INTERVAL '3 days',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

SELECT add_retention_policy('telemetry_daily', INTERVAL '2 years');
```

### Logika Query Backend
```python
def get_telemetry_for_chart(lamp_id, start, end, fields=None):
    duration = end - start
    if duration <= timedelta(days=90):
        return query_raw_telemetry(lamp_id, start, end, fields)
    else:
        return query_telemetry_daily(lamp_id, start, end, fields)
        # fields dari agregat: avg_*, min_*, max_*, total_*, sum_*
```

---

## 13. KONFIGURASI (.env)

```env
# APPLICATION
APP_NAME=SRS PJU Monitoring
APP_ENV=development
FRONTEND_URL=http://localhost:3000

# SECURITY
SECRET_KEY=ganti-dengan-string-random-minimal-64-karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
WS_TICKET_EXPIRE_SECONDS=30
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
EMAIL_VERIFY_TOKEN_EXPIRE_HOURS=24
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=1

# DATABASE
DATABASE_URL=postgresql+asyncpg://pju_user:pju_pass@localhost:5432/pju_db
DATABASE_URL_SYNC=postgresql://pju_user:pju_pass@localhost:5432/pju_db

# REDIS
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# EMAIL (SMTP)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@pju-monitoring.id
MAIL_FROM_NAME=SRS PJU Monitoring
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False

# MQTT
MQTT_HOST=localhost
MQTT_PORT=1883
MQTT_USERNAME=pju_backend
MQTT_PASSWORD=mqtt_secret
MQTT_BASE_TOPIC=pju/#

# FILE UPLOAD
MAX_AVATAR_SIZE_MB=2
MAX_ATTACHMENT_SIZE_MB=10
MAX_ATTACHMENT_PER_TICKET=5
UPLOAD_DIR=uploads/
FIRMWARE_DIR=firmware/

# ML
ML_MIN_TELEMETRY_FOR_PREDICTION=48
ML_MODELS_DIR=ml_models/

# ENERGY CALCULATION
CO2_KG_PER_KWH=0.87
TREE_CO2_KG_PER_YEAR=21.7

# RATE LIMITING
RATE_LIMIT_LOGIN=10/minute
RATE_LIMIT_REGISTER=5/hour

# BACKUP
BACKUP_DIR=/var/backups/pju
BACKUP_RETENTION_DAYS=30
```

---

## 14. EMAIL TEMPLATES (Jinja2)

| File | Dikirim Saat |
|---|---|
| `email_verify.html` | Setelah register |
| `account_approved.html` | Admin setujui akun |
| `account_rejected.html` | Admin tolak akun |
| `admin_approval_request.html` | Ada user baru menunggu |
| `password_reset.html` | Request lupa password |
| `password_changed.html` | Password berhasil diubah |
| `account_suspended.html` | Akun ditangguhkan |
| `ota_success.html` | OTA firmware berhasil (ke admin) |
| `ota_failed.html` | OTA firmware gagal (ke admin) |

---

## 15. STRUKTUR FOLDER & URUTAN EKSEKUSI

### Struktur Folder Backend

```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   ├── database.py
│   │   ├── validators.py
│   │   └── file_validation.py
│   ├── models/
│   │   ├── user.py
│   │   ├── auth_token.py
│   │   ├── audit_log.py
│   │   ├── notification.py
│   │   ├── alert_threshold.py
│   │   ├── place.py
│   │   ├── lamp.py
│   │   ├── lamp_schedule.py
│   │   ├── ota_job.py
│   │   ├── telemetry.py
│   │   ├── device_log.py
│   │   ├── prediction.py
│   │   ├── ml_model.py
│   │   ├── alert.py
│   │   ├── repair_ticket.py
│   │   ├── ticket_attachment.py
│   │   ├── report_job.py
│   │   └── energy_cost_config.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── lamp.py
│   │   ├── lamp_schedule.py
│   │   ├── ota.py
│   │   ├── telemetry.py
│   │   ├── device_log.py
│   │   ├── alert.py
│   │   ├── ticket.py
│   │   ├── energy.py
│   │   ├── report.py
│   │   └── search.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users_me.py
│   │   ├── admin_users.py
│   │   ├── notifications.py
│   │   ├── settings.py
│   │   ├── places.py
│   │   ├── lamps.py
│   │   ├── lamp_schedules.py
│   │   ├── lamp_ota.py
│   │   ├── monitoring.py
│   │   ├── energy.py
│   │   ├── alerts.py
│   │   ├── tickets.py
│   │   ├── reports.py
│   │   ├── search.py
│   │   ├── health.py
│   │   └── websocket.py
│   ├── services/
│   │   ├── email_service.py
│   │   ├── mqtt_service.py          # Subscribe + Publish
│   │   ├── ml_service.py
│   │   ├── alert_service.py
│   │   ├── notification_service.py
│   │   ├── report_service.py
│   │   ├── energy_service.py        # CO₂, cost comparison
│   │   ├── anomaly_service.py       # Hitung anomaly_score saat insert
│   │   └── websocket_service.py
│   ├── tasks/
│   │   ├── celery_app.py
│   │   ├── email_tasks.py
│   │   ├── lamp_tasks.py
│   │   ├── ml_tasks.py
│   │   ├── ota_tasks.py
│   │   ├── report_tasks.py
│   │   └── backup_tasks.py
│   └── templates/
│       ├── email_verify.html
│       ├── account_approved.html
│       ├── account_rejected.html
│       ├── admin_approval_request.html
│       ├── password_reset.html
│       ├── password_changed.html
│       ├── account_suspended.html
│       ├── ota_success.html
│       └── ota_failed.html
├── alembic/
│   ├── env.py
│   └── versions/
├── ml_models/
├── firmware/                        # Simpan file .bin firmware OTA
├── uploads/
│   ├── avatars/
│   └── tickets/
├── requirements.txt
├── .env
└── Dockerfile
```

### Urutan Implementasi untuk AI Codex

```
Tahap 1 — Fondasi
  1.1  Setup project FastAPI + folder structure
  1.2  Database schema lengkap + Alembic migration + seed data
       (thresholds 8 item, energy_cost_config default)
  1.3  Core: config.py, database.py, security.py, dependencies.py
  1.4  validators.py (GPS Indonesia), file_validation.py (magic bytes)
  1.5  Health check endpoint GET /health

Tahap 2 — Auth & User
  2.1  Register, email verify, login (access token memori JS + refresh HttpOnly cookie)
  2.2  Refresh rotation, logout, revoke
  2.3  Forgot/reset password
  2.4  Admin: user management + approval queue
  2.5  Profil user (avatar upload, ganti password + revoke semua token)
  2.6  GET /ws/ticket — one-time WebSocket ticket

Tahap 3 — Data Master
  3.1  Places CRUD + validasi koordinat
  3.2  Lamps CRUD + field baru (panel_watt_peak, battery_capacity_wh, last_* cached)
  3.3  Alert thresholds CRUD + seed 8 item
  3.4  Energy cost config CRUD (Admin only)

Tahap 4 — IoT & Realtime
  4.1  MQTT service:
       - Subscribe: telemetry, heartbeat, device-log, ota-status
       - Publish: cmd/brightness, cmd/schedule, cmd/ota
  4.2  Anomaly service (hitung anomaly_score saat terima telemetry)
  4.3  Deduplikasi MQTT via Redis (dedup key: lamp_code + timestamp)
  4.4  Alert service (cek semua threshold aktif termasuk battery, signal, temp_ambient)
  4.5  WebSocket service (Redis pub/sub broadcast)
  4.6  WebSocket endpoints (/ws/dashboard, /ws/map, /ws/lamp/{id}) — auth via ticket
  4.7  Notification service + endpoint

Tahap 5 — Background Jobs
  5.1  Celery + Redis setup
  5.2  Email tasks async
  5.3  Offline detection (setiap 5 menit)
  5.4  ML prediction task (on-demand + harian + weekly training)
       Feature set lengkap: battery, lux, temp_ambient, solar_power
  5.5  OTA task: process status + notifikasi
  5.6  Telemetry aggregate refresh
  5.7  Backup database harian

Tahap 6 — Lamp Control & OTA
  6.1  PATCH /lamps/{id}/brightness → publish MQTT + audit log
  6.2  Lamp schedules CRUD + POST /lamps/{id}/schedule publish MQTT
  6.3  OTA: upload firmware (Admin), trigger OTA per lampu, monitor status
  6.4  Device log endpoint (GET /lamps/{id}/device-logs)

Tahap 7 — Monitoring, Energy, Laporan, Search
  7.1  Monitoring API (KPI, trend, risk summary — raw vs agregat otomatis)
  7.2  GET /monitoring/telemetry/export → stream Excel/CSV langsung
  7.3  Energy service: CO₂ kalkulasi, cost comparison, impact tracker
  7.4  Energy API endpoints (/energy/summary, /flow, /cost-comparison, /impact)
  7.5  Search global endpoint
  7.6  Repair tickets CRUD + upload/download foto lampiran
  7.7  Report generation async (5 jenis: + Sustainability)
  7.8  Audit log endpoint

Tahap 8 — Frontend
  8.1  Layout: navbar (Ctrl+K search, notif bell, dark mode toggle), sidebar, breadcrumb
  8.2  Dark mode (Tailwind + useDarkMode hook + Leaflet dark tile)
  8.3  Error pages: 404, 403, 500 + fetch interceptor
  8.4  Skeleton screen components
  8.5  Landing page (semua sections sesuai frontend termasuk stats, exploded view, demo widget)
  8.6  Auth pages
  8.7  Dashboard home (8 KPI + energy summary strip)
  8.8  User management + approval queue
  8.9  Profil user
  8.10 Daftar tempat + detail tempat (avg battery, avg solar di summary)
  8.11 Daftar lampu (kolom Battery + Brightness) + detail lampu (semua section)
  8.12 Konfigurasi jadwal lampu (schedule builder + dimming timeline)
  8.13 Map lampu (popup dengan battery + brightness + solar)
  8.14 Monitoring dashboard (termasuk sensor analytics charts)
  8.15 Energy & Sustainability dashboard (cost comparison, CO₂, tree equivalent)
  8.16 Repair tickets + foto lampiran
  8.17 Laporan (5 jenis)
  8.18 Settings admin (threshold + ML + tarif energi + firmware OTA)
  8.19 Audit log
  8.20 Notifikasi in-app realtime
```

---

## 16. BACKUP & RECOVERY DATABASE

### Strategi Backup

```
Frekuensi  : Harian — jam 01:00
Retensi    : 30 hari
Format     : pg_dump custom format (.dump)
Lokasi     : BACKUP_DIR=/var/backups/pju
Extra      : firmware/ dan uploads/ di-backup terpisah via rsync
```

### Script Backup

```bash
#!/bin/bash
set -euo pipefail
BACKUP_DIR="${BACKUP_DIR:-/var/backups/pju}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="pju_db_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"
podman exec postgres pg_dump -U pju_user -d pju_db -Fc -f "/tmp/${FILENAME}"
podman cp "postgres:/tmp/${FILENAME}" "${BACKUP_DIR}/${FILENAME}"
find "$BACKUP_DIR" -name "pju_db_*.dump" -mtime "+${RETENTION_DAYS}" -delete
echo "Backup selesai: ${BACKUP_DIR}/${FILENAME}"
```

### Prosedur Restore

```bash
podman exec -i postgres pg_restore \
  -U pju_user -d pju_db --clean --if-exists \
  < /var/backups/pju/pju_db_20250115_010000.dump

podman exec postgres psql -U pju_user -d pju_db \
  -c "SELECT COUNT(*) FROM lamps; SELECT COUNT(*) FROM telemetry;"
```

### Celery Task Backup

```python
@celery.task
def run_database_backup():
    result = subprocess.run(['/app/scripts/backup_db.sh'], capture_output=True, text=True)
    if result.returncode != 0:
        logger.error(f"Backup gagal: {result.stderr}")
        notify_admins("Backup database gagal", result.stderr)
    else:
        logger.info(f"Backup sukses: {result.stdout}")
```

---

*Dokumen ini adalah referensi lengkap final v4 untuk eksekusi sistem SRS PJU Monitoring berbasis IoT Smart Solar Street Lamp.*

*Perubahan dari v3 ke v4:*
- *Payload MQTT direvisi total: tambah solar panel metrics, battery LiFePO4, lux, motion, signal_strength, brightness, temperature_internal vs ambient*
- *Tabel `telemetry` ditambah 12 field baru sesuai sensor ESP32*
- *Tabel `lamps` ditambah cached last values (battery, brightness, signal) + spec panel & baterai*
- *Tabel baru: `lamp_schedules`, `ota_jobs`, `device_logs`, `ticket_attachments`, `energy_cost_config`*
- *Alert threshold seed data tambah: battery_low, temperature_ambient, signal_strength*
- *Endpoint baru: /energy/*, /lamps/{id}/schedule, /lamps/{id}/ota, /lamps/{id}/device-logs, /lamps/{id}/brightness, /ws/ticket, /monitoring/telemetry/export*
- *Halaman baru: Energy & Sustainability Dashboard, Konfigurasi Jadwal Lampu, OTA di Settings*
- *WebSocket auth via one-time ticket (query param) — bukan header*
- *Anomaly score didefinisikan: dihitung backend, rule-based weighted deviation, range 0-1*
- *Deduplikasi MQTT via Redis dedup key*
- *ML feature set diperluas: tambah battery, lux, temp_ambient, solar_power*
- *Foto lampiran tiket: tabel `ticket_attachments` + endpoint upload/download*
- *Email template baru: ota_success, ota_failed*
