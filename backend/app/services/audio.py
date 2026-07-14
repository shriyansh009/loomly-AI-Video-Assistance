import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from pydub import AudioSegment

CHUNK_SECONDS = 20


# ---------------------------------------
# Extract audio from any media
# ---------------------------------------
def extract_audio(media_path: str) -> str:
    """
    Converts any supported media file to mono 16kHz WAV.

    Returns:
        Path to WAV file.
    """

    temp_dir = tempfile.mkdtemp(prefix="audio_")

    wav_path = os.path.join(
        temp_dir,
        "audio.wav",
    )

    command = [
        "ffmpeg",
        "-y",
        "-i",
        media_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        wav_path,
    ]

    subprocess.run(
        command,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    return wav_path


# ---------------------------------------
# Split audio into chunks
# ---------------------------------------
def split_audio(
    audio_path: str,
    chunk_seconds: int = CHUNK_SECONDS,
):
    """
    Split WAV into 20 second chunks.

    Returns:
        list[str]
    """

    audio = AudioSegment.from_wav(audio_path)

    chunk_ms = chunk_seconds * 1000

    output_dir = tempfile.mkdtemp(prefix="chunks_")

    chunks = []

    for index, start in enumerate(
        range(0, len(audio), chunk_ms)
    ):

        end = start + chunk_ms

        piece = audio[start:end]

        chunk_path = os.path.join(
            output_dir,
            f"chunk_{index}.wav",
        )

        piece.export(
            chunk_path,
            format="wav",
        )

        chunks.append(chunk_path)

    return chunks


# ---------------------------------------
# Cleanup
# ---------------------------------------
def cleanup_files(paths):
    """
    Deletes files/folders created during processing.
    """

    for path in paths:

        if not path:
            continue

        if os.path.isfile(path):
            os.remove(path)

        elif os.path.isdir(path):
            shutil.rmtree(
                path,
                ignore_errors=True,
            )