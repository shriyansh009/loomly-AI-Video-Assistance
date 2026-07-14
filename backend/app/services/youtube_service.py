import os
import shutil
import tempfile
from pathlib import Path

import yt_dlp

from .audio import extract_audio


def download_youtube_audio(url: str) -> str:
    """
    Downloads a YouTube video's audio and converts it to WAV.

    Returns:
        Path to the generated WAV file.
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
        shutil.rmtree(temp_dir)
        raise RuntimeError("Unable to download YouTube video.")

    media_path = str(downloaded[0])

    wav_path = extract_audio(media_path)

    return wav_path