import os
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from app.services.upload_service import process_uploaded_file


class YoutubeUploadTests(unittest.TestCase):
    @patch("app.services.upload_service.create_vector_store")
    @patch("app.services.upload_service.extract_questions", return_value=[])
    @patch("app.services.upload_service.extract_key_decisions", return_value=[])
    @patch("app.services.upload_service.extract_action_items", return_value=[])
    @patch("app.services.upload_service.generate_title", return_value="Video title")
    @patch("app.services.upload_service.summarize", return_value="Summary")
    def test_process_uploaded_file_accepts_existing_transcript_text(
        self,
        mock_summarize,
        mock_generate_title,
        mock_extract_action_items,
        mock_extract_key_decisions,
        mock_extract_questions,
        mock_create_vector_store,
    ):
        transcript_text = "Hello from the transcript.\nThis is a YouTube video summary."

        with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as temp_file:
            temp_file.write(transcript_text)
            temp_path = temp_file.name

        try:
            db = MagicMock()
            conversation = MagicMock(id=42, title=None, transcript=None)

            result = process_uploaded_file(
                db=db,
                conversation=conversation,
                file_path=temp_path,
                transcript_text=transcript_text,
            )

            self.assertEqual(result["transcript"], transcript_text)
            self.assertEqual(conversation.transcript, transcript_text)
            mock_create_vector_store.assert_called_once()
        finally:
            os.remove(temp_path)


if __name__ == "__main__":
    unittest.main()
