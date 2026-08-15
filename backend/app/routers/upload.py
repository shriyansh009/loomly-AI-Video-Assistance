import shutil
import tempfile
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Conversation, User
from ..services.upload_service import process_uploaded_file
from ..services.youtube_service import download_youtube_content

router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


@router.post("/{conversation_id}")
async def upload(
    conversation_id: int,
    file: UploadFile | None = File(default=None),
    url: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # User must provide exactly one source
    if file is None and not url:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a file or a YouTube URL.",
        )

    if file is not None and url:
        raise HTTPException(
            status_code=400,
            detail="Provide only one source: file or URL.",
        )

    temp_dir = None
    youtube_dir = None
    media_path = None
    transcript_text = None

    try:

        # -----------------------------
        # Local File Upload
        # -----------------------------
        if file is not None:

            temp_dir = tempfile.mkdtemp(prefix="upload_")

            file_path = Path(temp_dir) / file.filename

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            media_path = str(file_path)

        # -----------------------------
        # YouTube URL Upload
        # -----------------------------
        else:
            content = download_youtube_content(url)

            if content["type"] == "transcript":
                transcript_path = Path(content["path"])
                transcript_text = transcript_path.read_text(
                    encoding="utf-8",
                )
                youtube_dir = transcript_path.parent
            else:
                media_path = content["path"]
                youtube_dir = Path(media_path).parent

        result = process_uploaded_file(
            db=db,
            conversation=conversation,
            file_path=media_path,
            transcript_text=transcript_text,
        )

        return result

    finally:

        # Delete uploaded file
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)

        # Delete downloaded YouTube folder
        elif youtube_dir:
            try:
                shutil.rmtree(youtube_dir, ignore_errors=True)
            except Exception:
                pass








# import os
# import shutil
# import tempfile
# from pathlib import Path

# from fastapi import (
#     APIRouter,
#     Depends,
#     File,
#     HTTPException,
#     UploadFile,
# )
# from sqlalchemy.orm import Session

# from ..auth import get_current_user
# from ..database import get_db
# from ..models import Conversation, User
# from ..services.upload_service import process_uploaded_file

# router = APIRouter(
#     prefix="/upload",
#     tags=["Upload"],
# )


# @router.post("/{conversation_id}")
# async def upload_file(
#     conversation_id: int,
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):

#     conversation = (
#         db.query(Conversation)
#         .filter(
#             Conversation.id == conversation_id,
#             Conversation.user_id == current_user.id,
#         )
#         .first()
#     )

#     if conversation is None:
#         raise HTTPException(
#             status_code=404,
#             detail="Conversation not found",
#         )

#     temp_dir = tempfile.mkdtemp(prefix="upload_")

#     file_path = Path(temp_dir) / file.filename

#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     try:

#         result = process_uploaded_file(
#             db=db,
#             conversation=conversation,
#             file_path=str(file_path),
#         )

#         return result

#     finally:

#         shutil.rmtree(temp_dir, ignore_errors=True)