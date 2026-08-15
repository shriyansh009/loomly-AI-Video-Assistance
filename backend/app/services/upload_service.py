import os

from sqlalchemy.orm import Session

from ..core.extractor import (
    extract_action_items,
    extract_key_decisions,
    extract_questions,
)
from ..core.rag_engine import create_vector_store
from ..core.summarizer import (
    generate_title,
    summarize,
)
from ..models import Conversation
from .transcription_service import transcribe

VECTOR_DB_DIR = "vector_db"


def process_uploaded_file(
    db: Session,
    conversation: Conversation,
    file_path: str | None,
    transcript_text: str | None = None,
):
    """
    Complete upload pipeline.

    1. Transcribe or reuse transcript text
    2. Summarize
    3. Extract meeting insights
    4. Build vector database
    5. Update conversation
    """

    if transcript_text is not None:
        transcript = transcript_text.strip()
    else:
        if not file_path:
            raise ValueError("A file path or transcript text is required.")
        transcript = transcribe(file_path)

    if not transcript:
        raise ValueError("No transcript content was generated for this upload.")

    # -------------------------
    # Summary
    # -------------------------
    summary = summarize(transcript)

    # -------------------------
    # Title
    # -------------------------
    title = generate_title(transcript)

    if not title:
        title = summary.split("\n")[0][:60]

    # -------------------------
    # Meeting Insights
    # -------------------------
    action_items = extract_action_items(transcript)

    key_decisions = extract_key_decisions(transcript)

    open_questions = extract_questions(transcript)

    # -------------------------
    # Vector Store
    # -------------------------
    vector_path = os.path.join(
        VECTOR_DB_DIR,
        f"conversation_{conversation.id}",
    )

    os.makedirs(vector_path, exist_ok=True)

    create_vector_store(
        transcript=transcript,
        save_path=vector_path,
    )

    # -------------------------
    # Update Database
    # -------------------------
    conversation.title = title
    conversation.transcript = transcript

    db.commit()
    db.refresh(conversation)

    # -------------------------
    # Return
    # -------------------------
    return {
        "conversation_id": conversation.id,
        "title": title,
        "summary": summary,
        "transcript": transcript,
        "vector_path": vector_path,
        "action_items": action_items,
        "key_decisions": key_decisions,
        "open_questions": open_questions,
    }