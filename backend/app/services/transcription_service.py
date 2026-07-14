from pathlib import Path
from .audio import extract_audio, split_audio, cleanup_files
from ..core.transcriber import transcribe_all


def transcribe_file(
    file_path: str,
    language: str = "english",
):
    """
    Converts any media file into text.

    Returns
    -------
    str
        Complete transcript
    """

    wav_path = None
    chunks = []

    try:

        suffix = Path(file_path).suffix.lower()

        if suffix == ".wav":
            wav_path = file_path
        else:
            wav_path = extract_audio(file_path)

        chunks = split_audio(
            wav_path,
            chunk_seconds=20,
        )

        transcript = transcribe_all(
            chunks,
            language=language,
        )

        return transcript

    finally:

        cleanup_files(chunks)

        if wav_path != file_path:
            cleanup_files([wav_path])



def transcribe(file_path: str):

    wav = extract_audio(file_path)

    chunks = split_audio(wav)

    transcript = transcribe_all(chunks)

    return transcript
