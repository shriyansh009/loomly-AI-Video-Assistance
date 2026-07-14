from datetime import datetime
import os
from sqlalchemy.orm import Session

from ..core.rag_engine import (
    ask_question,
    get_rag_chain,
    get_llm,
)
from ..enums import MessageRole
from ..models import Conversation, Message

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

_general_chain = None
VECTOR_DB_DIR = "vector_db"

def get_general_chain():
    global _general_chain

    if _general_chain is None:
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are Loomly AI.

You are a friendly AI assistant.

If the user is asking a normal question,
answer normally.

Keep answers concise unless asked otherwise.
""",
                ),
                ("human", "{question}"),
            ]
        )

        _general_chain = (
            prompt
            | get_llm()
            | StrOutputParser()
        )

    return _general_chain

def save_message(
    db: Session,
    conversation: Conversation,
    role: MessageRole,
    content: str,
):
    message = Message(
        role=role,
        content=content,
        conversation_id=conversation.id,
    )

    db.add(message)

    conversation.updated_at = datetime.utcnow()
    conversation.last_message_at = datetime.utcnow()

    db.commit()

    db.refresh(message)

    return message


def build_chat_history(
    conversation: Conversation,
):
    history = []

    for message in conversation.messages:

        history.append(
            (
                message.role.value.lower(),
                message.content,
            )
        )

    return history

def chat_with_llm(
    question: str,
):
    chain = get_general_chain()

    return chain.invoke(
        {
            "question": question,
        }
    )

def chat_with_transcript(
    question: str,
    conversation_id: int,
):
    save_path = os.path.join(
        VECTOR_DB_DIR,
        f"conversation_{conversation_id}",
    )

    if not os.path.exists(save_path):
        raise FileNotFoundError(
            f"Vector database not found: {save_path}"
        )

    rag_chain = get_rag_chain(save_path)

    return ask_question(
        rag_chain,
        question,
    )



def generate_response(
    db: Session,
    conversation: Conversation,
    question: str,
):
    save_message(
        db,
        conversation,
        MessageRole.USER,
        question,
    )

    transcript = (
        conversation.transcript or ""
    ).strip()

    if transcript:

        answer = chat_with_transcript(
            question,
            conversation.id,
        )

    else:

        answer = chat_with_llm(
            question,
        )

    save_message(
        db,
        conversation,
        MessageRole.ASSISTANT,
        answer,
    )

    return answer


