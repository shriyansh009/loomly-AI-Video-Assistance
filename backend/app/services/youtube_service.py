import os
import shutil
import tempfile
from pathlib import Path

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
)

from .audio import extract_audio


def get_video_id(url: str) -> str:
    """
    Extracts the YouTube video ID from a URL.
    """

    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        info = ydl.extract_info(url, download=False)

    video_id = info.get("id")

    if not video_id:
        raise RuntimeError("Unable to extract YouTube video ID.")

    return video_id


def download_youtube_transcript(url: str) -> str | None:
    """
    Attempts to download an existing YouTube transcript.

    Returns:
        Path to transcript.txt if captions are available.
        None if captions are unavailable.
    """

    temp_dir = tempfile.mkdtemp(prefix="youtube_transcript_")
    transcript_path = os.path.join(temp_dir, "transcript.txt")

    try:
        video_id = get_video_id(url)

        api = YouTubeTranscriptApi()

        # Fetch the transcript.
        transcript = api.fetch(video_id)

        with open(transcript_path, "w", encoding="utf-8") as f:
            for item in transcript:
                timestamp = format_timestamp(item.start)
                f.write(f"[{timestamp}] {item.text}\n")

        return transcript_path

    except (
        NoTranscriptFound,
        TranscriptsDisabled,
    ):
        shutil.rmtree(temp_dir, ignore_errors=True)
        return None

    except Exception:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return None


def format_timestamp(seconds: float) -> str:
    """
    Converts seconds to HH:MM:SS.
    """

    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)

    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def download_youtube_audio(url: str) -> str:
    """
    Downloads YouTube audio and converts it to WAV.

    Returns:
        Path to generated WAV file.
    """

    temp_dir = tempfile.mkdtemp(prefix="youtube_")

    output_template = os.path.join(
        temp_dir,
        "video.%(ext)s",
    )

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    downloaded = list(Path(temp_dir).glob("video.*"))

    if not downloaded:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise RuntimeError("Unable to download YouTube video.")

    media_path = str(downloaded[0])

    wav_path = extract_audio(media_path)

    return wav_path


def download_youtube_content(url: str) -> dict:
    """
    Gets a YouTube video's transcript.

    Strategy:

    1. Try YouTube's existing captions.
    2. If captions are unavailable, download audio.
    3. Return the appropriate source.

    Returns:
        {
            "type": "transcript" | "audio",
            "path": "..."
        }
    """

    # -----------------------------------------
    # 1. Try existing YouTube captions
    # -----------------------------------------

    transcript_path = download_youtube_transcript(url)

    if transcript_path:
        return {
            "type": "transcript",
            "path": transcript_path,
        }

    # -----------------------------------------
    # 2. No captions → download audio
    # -----------------------------------------

    wav_path = download_youtube_audio(url)

    return {
        "type": "audio",
        "path": wav_path,
    }