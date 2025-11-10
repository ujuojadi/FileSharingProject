# FileShareProject — FastAPI + React prototype

A FastAPI backend prototype with JWT authentication and a small React frontend. This README documents how to run the project locally and how to configure SQLite for development.

## What this repo contains

- `app/` — FastAPI backend (async SQLAlchemy)
- `file-share-frontend/` — React frontend (Create React App)
- `tests/` — pytest tests for core flows

## High-level defaults

- Development DB: SQLite
- Password hashing: `passlib` (PBKDF2-SHA256 is used in dev to avoid bcrypt 72-byte limits)
- Backend default port: `8000`; Frontend default port: `3000`

## Quick start (Windows PowerShell)

1) Create and activate a Python virtual environment, then install dependencies

```powershell
# from repo root
python -m venv .venv
.\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

2) Configure environment variables

Copy `.env.example` to `.env` and edit values (DO NOT commit your `.env`):

```powershell
copy .env.example .env
```

Key env vars:

- `NOTESHARE_JWT_SECRET_KEY` (or legacy `SECRET_KEY`) — secret used to sign JWTs.
- `NOTESHARE_DATABASE_URL` — full async SQLAlchemy URL for the DB.
- `REACT_APP_API_URL` — set in `file-share-frontend/.env` so frontend points to backend (e.g. `http://localhost:8000`).

3) Initialize the database schema (if applicable)

If you're using the SQL-backed repository implementation and not the default in-memory repo, run:

```powershell
python init_db.py
```

4) Run the backend

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Open the API docs at: http://localhost:8000/docs

5) Run the frontend (separate terminal)

```powershell
cd file-share-frontend
npm install
# ensure file-share-frontend/.env has REACT_APP_API_URL=http://localhost:8000
npm start
```

Open the frontend at http://localhost:3000


## Security

- Do not commit `.env` or secrets.
- Use a strong `NOTESHARE_JWT_SECRET_KEY` in production.
