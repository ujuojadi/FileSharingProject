from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from settings import settings
from database import get_db
from models import User, RegisterRequest
from fastapi.middleware.cors import CORSMiddleware
import httpx


app = FastAPI()

origins = (
    [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    if settings.CORS_ORIGINS and settings.CORS_ORIGINS != "*"
    else ["*"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    print("authenticate_user: ", end="")
    if user is None:
        print("user not found")
    else:
        print(user.name + " authenticated")
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user.name}

def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if not sub:
            raise ValueError("Missing sub")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# testing
@app.get("/me")
async def me(email: str = Depends(get_current_user_email), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "created_at": user.created_at}

from fastapi import FastAPI


@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}

GO_SERVER_URL = settings.GO_BACKEND_URL

@app.get("/start-network")
async def start_network():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{GO_SERVER_URL}/start")
        return {"status": response.status_code, "detail": response.json()}

@app.get("/status")
async def check_status():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{GO_SERVER_URL}/status")
        return {"status": response.status_code, "detail": response.json()}

@app.get("/ping-db")
async def ping_db(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    return {"db_connected": bool(result.scalar())}


@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest = Depends(RegisterRequest.as_form),
    db: AsyncSession = Depends(get_db),
):
    # check if user exists
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # create user
    hashed = pwd_context.hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed, name=payload.name)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "name": user.name}}
