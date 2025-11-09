from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, func
from fastapi import Form
from database import Base
from pydantic import BaseModel, EmailStr, constr

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime, server_default=func.now())

class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    name: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        username: EmailStr = Form(...),
        password: str = Form(..., min_length=8),
        name: Optional[str] = Form(None),
    ):
        return cls(username=username, password=password, name=name)
