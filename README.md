# FileShareProject — FastAPI + React prototype

A FastAPI backend prototype with JWT authentication and a small React frontend. This README documents how to run the project locally and how to configure MySQL (or the default SQLite) for development.

## What this repo contains

- `app/` — FastAPI backend (async SQLAlchemy)
- `file-share-frontend/` — React frontend (Create React App)
- `tests/` — pytest tests for core flows

## High-level defaults

- Development DB: MySQL (the project tries a local MySQL URL by default). You can switch to SQLite by setting `NOTESHARE_DATABASE_URL=sqlite+aiosqlite:///./dev.db`.
- Production/alternate DB: MySQL/MariaDB supported via async driver (`aiomysql`)
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
- `NOTESHARE_DATABASE_URL` — full async SQLAlchemy URL for the DB. See examples below.
- `REACT_APP_API_URL` — set in `file-share-frontend/.env` so frontend points to backend (e.g. `http://localhost:8000`).

### DB examples

- SQLite (recommended for local dev):

```powershell
# NOTESHARE_DATABASE_URL=sqlite+aiosqlite:///./dev.db
```

- MySQL / MariaDB (async driver `aiomysql` required):

```powershell
# NOTESHARE_DATABASE_URL=mysql+aiomysql://fileshare_user:your_db_password_here@localhost:3306/fileshare_db?charset=utf8mb4
```

The app will also accept legacy `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` env variables and automatically construct a MySQL URL for convenience.

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

## MySQL notes / troubleshooting

- The project uses async SQLAlchemy and expects an async driver for MySQL. We added `aiomysql` to `requirements.txt` so installing Python deps will bring it in.
- If you see connection errors, verify `NOTESHARE_DATABASE_URL` is correct, or provide legacy `DB_*` env variables.
- If the backend cannot be reached from the frontend, check CORS origins and that the backend is running.
- If you see errors about pydantic email validation, run:

```powershell
python -m pip install 'pydantic[email]'
```

## Environment variable precedence

The app loads settings using `pydantic-settings` from the `.env` file and environment. The effective DB URL is chosen in this order:

1. `NOTESHARE_DATABASE_URL` (preferred)
2. `DATABASE_URL` or `DB_URL`
3. Constructed from `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` if present
4. If no DB URL or DB_* vars are provided, the app defaults to a local MySQL URL configured in `app/core/config.py`. To force SQLite set `NOTESHARE_DATABASE_URL=sqlite+aiosqlite:///./dev.db`.

## Security

- Do not commit `.env` or secrets.
- Use a strong `NOTESHARE_JWT_SECRET_KEY` in production.

## Further improvements (todo)

- Add a `docker-compose.yml` to start backend, frontend and MySQL for reproducible dev environments.
- Add scripted migrations (Alembic) for schema evolution.

---

If you'd like I can now:

- Add a sample `docker-compose.yml` for MySQL + backend + frontend, or
- Wire up Alembic migrations, or
- Create a `file-share-frontend/.env.example` and copy instructions to the frontend README.

Tell me which of those you prefer next.
