from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base
from .enums import UserRole, MessageRole


# ==========================
# User
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name = Column(
        String(255),
        nullable=False,
    )

    hashed_password = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        Enum(
            UserRole,
            values_callable=lambda enum: [e.value for e in enum],
            name="user_role",
        ),
        nullable=False,
        default=UserRole.USER,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    conversations = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ==========================
# Conversation
# ==========================
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
        default="New Chat",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    last_message_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    transcript = Column(
    Text,
    nullable=True,
)

    vector_path = Column(
    String(500),
    nullable=True,
    )


    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user = relationship(
        "User",
        back_populates="conversations",
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


# ==========================
# Message
# ==========================
class Message(Base):
    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    role = Column(
        Enum(
            MessageRole,
            values_callable=lambda enum: [e.value for e in enum],
            name="message_role",
        ),
        nullable=False,
        default=MessageRole.USER,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    model_name = Column(
        String(100),
        nullable=True,
        default="mistral-small-latest",
    )

    tokens = Column(
        Integer,
        default=0,
        nullable=False,
    )

    response_time = Column(
        Integer,
        nullable=True,
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )