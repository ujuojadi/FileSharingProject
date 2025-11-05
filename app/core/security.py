from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import get_settings


# Use PBKDF2-SHA256 to avoid bcrypt 72-byte password-length limitation in dev/test envs.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_delta_minutes: Optional[int] = None, extra_claims: Optional[dict[str, Any]] = None) -> str:
    settings = get_settings()
    expire_minutes = expires_delta_minutes if expires_delta_minutes is not None else settings.access_token_expire_minutes
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)

    to_encode: dict[str, Any] = {"exp": expire, "sub": subject}
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError as ex:  # includes ExpiredSignatureError
        raise ValueError("Invalid or expired token") from ex
