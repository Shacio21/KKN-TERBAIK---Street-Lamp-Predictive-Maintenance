# Panduan Menjalankan Sistem PJU IoT Monitor

## Prasyarat
- Docker + Docker Compose v2
- Node.js 20+
- Python 3.11+ (untuk development lokal)

---

## 🚀 Cara Cepat (Docker Compose)

### 1. Salin file konfigurasi
```bash
cd backend
cp .env.example .env
# Edit .env jika perlu (SECRET_KEY, SMTP, dll)
```

### 2. Jalankan semua service
```bash
docker compose up -d
```

Service yang akan berjalan:
| Service | Port | Keterangan |
|---------|------|-----------|
| PostgreSQL (TimescaleDB) | 5432 | Database utama |
| Redis | 6379 | Cache + Celery broker |
| EMQX (MQTT) | 1883, 18083 | IoT message broker |
| FastAPI Backend | 8000 | REST API + WebSocket |
| Celery Worker | — | Background tasks |
| Celery Beat | — | Scheduled tasks |

### 3. Migrasi database otomatis
Backend container akan otomatis menjalankan:
```
Alembic upgrade head → seed admin + threshold data
```

### 4. Jalankan Frontend
```bash
cd ..  # ke root project
npm install
npm run dev
```
Frontend tersedia di: **http://localhost:5173**
Backend API docs di: **http://localhost:8000/docs**

---

## 🗄️ Database (PostgreSQL + TimescaleDB)

### Tabel yang dibuat
| Tabel | Deskripsi |
|-------|-----------|
| `users` | Akun pengguna (admin/operator) |
| `auth_tokens` | Refresh token + email verify token |
| `audit_logs` | Log aksi semua pengguna |
| `notifications` | Notifikasi in-app |
| `alert_thresholds` | Konfigurasi ambang batas alert |
| `places` | Lokasi/area pemasangan lampu |
| `lamps` | Data master lampu |
| `lamp_schedules` | Jadwal nyala/dimming |
| `ota_jobs` | Job update firmware |
| `telemetry` | Data sensor real-time (time-series) |
| `device_logs` | Log event dari perangkat |
| `predictions` | Hasil prediksi ML |
| `alerts` | Alert yang ter-trigger |
| `repair_tickets` | Tiket perbaikan |
| `ticket_logs` | Riwayat status tiket |
| `ticket_attachments` | File foto tiket |
| `report_jobs` | Riwayat generate laporan |
| `energy_cost_config` | Tarif listrik PLN |

### Seed data default
- **Admin**: email dari `FIRST_ADMIN_EMAIL` di `.env`
- **Alert Threshold**: 8 aturan (tegangan, arus, suhu, baterai, sinyal)
- **Tarif Energi**: Rp 1.444,70/kWh (PLN default)

### Menjalankan migrasi manual
```bash
cd backend
# Pastikan DATABASE_URL sudah benar di .env
python -m alembic upgrade head
python -m app.scripts.seed
```

### Membuat migrasi baru
```bash
cd backend
python -m alembic revision --autogenerate -m "deskripsi_perubahan"
python -m alembic upgrade head
```

---

## 🤖 ML Model

### Format model yang diharapkan
File: `backend/ml_models/failure_predictor.joblib`

Isi file (dict yang disimpan dengan `joblib.dump`):
```python
{
    "model": sklearn_model,          # Classifier dengan predict_proba()
    "feature_names": [...],          # List nama fitur (68 features)
    "version": "v1.0",               # String versi
    "accuracy": 0.85,               # Akurasi model (float)
}
```

### Features yang digunakan (68 total)
Untuk setiap kolom sensor (11 kolom), diekstrak: mean, std, min, max, range, last
- `voltage`, `current`, `power`, `battery_level`, `battery_voltage`
- `solar_power`, `temperature_internal`, `temperature_ambient`
- `lux`, `signal_strength`, `anomaly_score`

Plus derived features:
- `data_points` — jumlah telemetry 7 hari terakhir
- `data_freshness_hours` — jam sejak telemetry terakhir
- `battery_slope` — tren penurunan baterai
- `anomaly_freq` — frekuensi anomaly score > 0.7

> **Catatan**: Jika model belum tersedia, sistem otomatis menggunakan **rule-based predictor** sebagai fallback.

---

## 🔧 Celery Tasks

| Task | Jadwal | Fungsi |
|------|--------|--------|
| `check_offline_lamps` | Setiap 5 menit | Deteksi lampu offline > 30 menit |
| `run_daily_ml_all_lamps` | Setiap hari | Prediksi maintenance semua lampu |
| `run_database_backup` | Setiap hari | Backup PostgreSQL → `backend/backups/` |

---

## 📡 MQTT Topics

Format: `pju/{lamp_code}/{event}`

| Topic | Keterangan |
|-------|-----------|
| `pju/{code}/telemetry` | Data sensor |
| `pju/{code}/heartbeat` | Heartbeat (60s) |
| `pju/{code}/log` | Log event device |
| `pju/{code}/ota/status` | Status update firmware |
| `pju/{code}/cmd/brightness` | Perintah ubah brightness |
| `pju/{code}/cmd/ota` | Perintah OTA update |

---

## 🌐 API Endpoints Utama

| Method | Path | Keterangan |
|--------|------|-----------|
| POST | `/auth/register` | Daftar akun |
| POST | `/auth/login` | Login (rate: 10/min) |
| GET | `/users/me` | Info user login |
| GET | `/lamps` | Daftar lampu |
| GET | `/lamps/{id}` | Detail lampu |
| GET | `/monitoring/{lamp_id}/telemetry` | Data telemetry |
| GET | `/reports/{type}?start_date=&end_date=&format=csv` | Download laporan |
| GET | `/audit-logs` | Log audit (admin) |
| WS | `/ws/{room}` | WebSocket realtime |

---

## 🔒 Rate Limiting
- Login: 10 request/menit per IP
- Register: 5 request/jam per IP

---

## 🛠️ Troubleshooting

### Database tidak bisa konek
```bash
docker compose ps   # cek status container
docker compose logs postgres  # lihat error
```

### Migrasi gagal
```bash
# Reset database (HATI-HATI: hapus semua data!)
docker compose down -v
docker compose up -d
```

### Backend error
```bash
docker compose logs backend --tail=50
```

### MQTT tidak konek
- EMQX admin panel: http://localhost:18083 (admin/public)
- Cek MQTT_HOST, MQTT_PORT di `.env`
