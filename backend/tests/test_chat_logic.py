import unittest

from app.routers.chat import is_youtube_url


class ChatLogicTests(unittest.TestCase):
    def test_detects_youtube_urls(self):
        self.assertTrue(is_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
        self.assertTrue(is_youtube_url("https://youtu.be/dQw4w9WgXcQ"))
        self.assertFalse(is_youtube_url("https://example.com/video"))
        self.assertFalse(is_youtube_url("just a normal question"))


if __name__ == "__main__":
    unittest.main()
