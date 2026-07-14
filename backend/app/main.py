from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .auth import (
    create_access_token,
    get_current_user,
    get_password_hash,
    serialize_user,
    verify_password,
)
from .database import Base, engine, get_db
from .models import User , Conversation 
from .schemas import DashboardResponse, LoginRequest, TokenResponse, UserCreate, UserResponse , ConversationCreate, ConversationResponse , MessageCreate , MessageResponse
from .routers import conversations, messages, upload, LLM, chat

app = FastAPI(title="AI Video Assistant ", version="1.0.0")

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(upload.router)
app.include_router(LLM.router)
app.include_router(chat.router)

@app.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role})
    return TokenResponse(access_token=token, user=serialize_user(new_user))


@app.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=serialize_user(user))


@app.get("/dashboard", response_model=DashboardResponse)
def dashboard(current_user: User = Depends(get_current_user)):
    return DashboardResponse(message="Welcome to your dashboard", user=serialize_user(current_user))


@app.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)
