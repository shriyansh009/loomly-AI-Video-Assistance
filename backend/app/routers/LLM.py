from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Conversation, User
from ..services.chat_service import generate_response

router = APIRouter(
    prefix="/llm",
    tags=["LLM"],
)


class ChatRequest(BaseModel):
    conversation_id: int
    question: str


class ChatResponse(BaseModel):
    answer: str


@router.post("/ask", response_model=ChatResponse)
def ask(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == payload.conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    answer = generate_response(
        db=db,
        conversation=conversation,
        question=payload.question,
    )

    return ChatResponse(
        answer=answer,
    )