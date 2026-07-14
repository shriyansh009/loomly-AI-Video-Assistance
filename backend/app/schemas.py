from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from .enums import MessageRole, UserRole


class UserBase(BaseModel):
    email: str
    full_name: str = Field(min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DashboardResponse(BaseModel):
    message: str
    user: UserResponse


class ConversationCreate(BaseModel):
    title: str = "New Chat"


class ConversationUpdate(BaseModel):
    title: str


class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    last_message_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    role: MessageRole
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)



class UploadResponse(BaseModel):
    conversation_id: int
    title: str
    summary: str
    transcript: str | None = None