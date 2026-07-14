import os
from pathlib import Path

try:
    from pydub import AudioSegment
except ImportError:  # pragma: no cover - optional dependency
    AudioSegment = None


def split_audio(audio_path: str, chunk_minutes: int = 10) -> list[str]:
    """Split an audio file into smaller WAV chunks."""
    if AudioSegment is None:
        raise RuntimeError("pydub is not installed; cannot split audio")

    audio = AudioSegment.from_wav(audio_path)
    chunk_ms = chunk_minutes * 60 * 1000
    chunks: list[str] = []

    for index, start in enumerate(range(0, len(audio), chunk_ms)):
        chunk = audio[start:start + chunk_ms]
        chunk_path = f"{audio_path}_chunk_{index}.wav"
        chunk.export(chunk_path, format="wav")
        chunks.append(chunk_path)

    return chunks
