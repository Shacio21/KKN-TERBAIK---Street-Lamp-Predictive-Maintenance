# Smart Solar Street Lamp Monitoring

Frontend Vite + React dan backend FastAPI untuk monitoring PJU berbasis IoT sesuai `srs_v4.md`.

## Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend membaca `VITE_API_BASE_URL` dan otomatis fallback ke demo data jika backend belum siap.

## Backend

```bash
cd backend
cp .env.example .env
python3.12 -m pip install -r requirements.txt
python3.12 -m alembic -c alembic.ini upgrade head
PYTHONPATH=. python3.12 -m app.scripts.seed
PYTHONPATH=. python3.12 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Atau dari root repo:

```bash
npm run backend:migrate
npm run backend:seed
npm run dev:backend
```

API docs tersedia di `http://127.0.0.1:8000/docs`.

## Validasi

```bash
npm run lint
npm run build
npm run backend:check
npm run backend:test
```
