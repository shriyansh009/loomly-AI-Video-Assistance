import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app.routers.chat import ChatRequest, chat


class ChatLogicTests(unittest.TestCase):
    @patch("app.routers.chat.generate_response", return_value="The meeting starts at 10.")
    def test_chat_returns_generated_answer(self, generate_response):
        conversation = SimpleNamespace(id=42, user_id=7)
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = conversation

        response = chat(
            conversation_id=42,
            payload=ChatRequest(question="When does the meeting start?"),
            db=db,
            current_user=SimpleNamespace(id=7),
        )

        self.assertEqual(response.answer, "The meeting starts at 10.")
        generate_response.assert_called_once_with(
            db=db,
            conversation=conversation,
            question="When does the meeting start?",
        )


if __name__ == "__main__":
    unittest.main()
