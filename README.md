# FastAPI Login & JWT Authentication Prototype

A simple **FastAPI** backend prototype demonstrating login authentication using hashed passwords and **JWT tokens**.

## Features

- **Framework:** FastAPI
- **Authentication:** Login with email and password
- **Password Security:** Passwords hashed using **bcrypt** (`passlib`)
- **Token:** Returns **JWT access token** for authenticated sessions
- **CORS:** Enabled for development (`allow_origins=["*"]`)
- **Database:** In-memory **`fake_users_db`** used for testing

## Running the Server

```bash
uvicorn main:app --reload
