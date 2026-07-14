import unittest

from app.auth import get_password_hash, verify_password
from app.enums import UserRole


class AuthTests(unittest.TestCase):
    def test_password_hash_and_verify(self):
        password = "123456"
        hashed = get_password_hash(password)

        self.assertNotEqual(hashed, password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrong-password", hashed))

    def test_user_role_enum_values_match_database(self):
        self.assertEqual(UserRole.USER.value, "USER")
        self.assertEqual(UserRole.ADMIN.value, "ADMIN")
        self.assertEqual(UserRole("USER"), UserRole.USER)


if __name__ == "__main__":
    unittest.main()
