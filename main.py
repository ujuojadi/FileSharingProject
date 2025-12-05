from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from settings import settings
from database import get_db
from models import User, RegisterRequest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import requests

MAX_BCRYPT_BYTES = 72  # bcrypt max password length

app = FastAPI()

# ----------------------
# CORS setup
# ----------------------
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

# ----------------------
# Security / Auth config
# ----------------------
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

GO_SERVER_URL = settings.GO_BACKEND_URL  # e.g. "http://localhost:9000"

# ----------------------
# Password helpers
# ----------------------
def truncate_password_str(password: str) -> str:
    """
    Truncate the password string to bcrypt limit.
    bcrypt counts bytes, so we truncate based on UTF-8 encoding.
    """
    encoded = password.encode("utf-8")[:MAX_BCRYPT_BYTES]
    return encoded.decode("utf-8", errors="ignore")  # safely decode truncated bytes


def hash_password(password: str) -> str:
    return pwd_context.hash(truncate_password_str(password))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # truncate string, pass as string to Passlib (do not encode manually)
    return pwd_context.verify(truncate_password_str(plain_password), hashed_password)


# ----------------------
# Auth helpers
# ----------------------
async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    print("authenticate_user: ", end="")
    if not user:
        print("user not found")
        return None
    if not verify_password(password, user.hashed_password):
        print("password mismatch")
        return None
    print(f"{user.name} authenticated")
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def get_current_user_email(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if not sub:
            raise ValueError("Missing sub")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ----------------------
# Routes: Auth
# ----------------------
@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest = Depends(RegisterRequest.as_form),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(payload.password)
    user = User(email=payload.email, hashed_password=hashed, name=payload.name)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"email": user.email, "name": user.name},
    }


@app.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.email})
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "name": user.name,
        },
    }


@app.get("/me")
async def me(
    email: str = Depends(get_current_user_email),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": user.email, "name": user.name, "created_at": user.created_at}


# ----------------------
# Health / misc
# ----------------------
@app.get("/")
def read_root():
    return {"message": "FastAPI is running!"}


@app.get("/ping-db")
async def ping_db(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    return {"db_connected": bool(result.scalar())}


# ----------------------
# File Upload (proxy to Go backend)
# ----------------------
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    courseCode: str = Form(...),
    courseName: str = Form(""),
    description: str = Form(""),
):
    # Send file to Go backend as multipart/form-data
    upload_url = f"{GO_SERVER_URL}/files?key={file.filename}"
    async with httpx.AsyncClient() as client:
        files = {"file": (file.filename, await file.read(), file.content_type)}
        response = await client.post(upload_url, files=files)

    if response.status_code not in [200, 201]:
        raise HTTPException(status_code=400, detail="Failed to upload to Go server")

    go_data = response.json()
    return {
        "filename": file.filename,
        "go_key": go_data.get("key"),
        "size_bytes": getattr(file, "size", 0),
        "course_code": courseCode,
        "course_name": courseName,
        "description": description,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "content_type": file.content_type,
    }


# ----------------------
# File Download (proxy from Go backend)
# Frontend calls: GET /files/{file_id}/download
# where file_id is the UUID/key returned from Go.
# ----------------------
@app.get("/files/{file_id}/download")
def download_file(file_id: str):
    # Ask the Go server for the file by its key/ID
    go_url = f"{GO_SERVER_URL}/files/{file_id}"

    resp = requests.get(go_url, stream=True)

    if resp.status_code != 200:
        raise HTTPException(status_code=404, detail="File not found on Go server")

    # Stream the file back to the client
    def file_iterator():
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                yield chunk

    return StreamingResponse(
        file_iterator(),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{file_id}"',
        },
    )


# ----------------------
# Go network control
# ----------------------
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
