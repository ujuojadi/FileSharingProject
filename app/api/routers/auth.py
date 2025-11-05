from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.repositories.interfaces import UsersRepository
from app.services.deps import get_users_repo
from app.schemas.user import UserCreate, UserPublic, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(UserCreate):
    pass


class VerifyEmailRequest(BaseModel):
    email: EmailStr


@router.post("/register", response_model=UserPublic, status_code=201)
async def register(data: RegisterRequest, users_repo: UsersRepository = Depends(get_users_repo)) -> UserPublic:
    settings = get_settings()
    if not data.email.lower().endswith("@" + settings.allowed_email_domain):
        raise HTTPException(status_code=400, detail=f"Email must end with @{settings.allowed_email_domain}")
    existing = await users_repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    try:
        user = await users_repo.create(data)
    except ValueError as ex:
        # Likely a password/hash related error (e.g. bcrypt 72-byte limit)
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    # Simulate sending verification email (log/print)
    print(f"[Email] Verification email sent to {user.email}")
    return UserPublic.model_validate(user)


@router.post("/verify", response_model=dict)
async def verify_email(req: VerifyEmailRequest, users_repo: UsersRepository = Depends(get_users_repo)) -> dict:
    user = await users_repo.get_by_email(req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await users_repo.verify(user.id)
    print(f"[Email] {user.email} verified")
    return {"message": "Email verified"}


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), users_repo: UsersRepository = Depends(get_users_repo)) -> TokenResponse:
    user = await users_repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(subject=user.email, extra_claims={"uid": str(user.id)})
    return TokenResponse(access_token=access_token)
