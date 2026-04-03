import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.core.security import hash_password, verify_password


def main() -> None:
    password = "123456"
    wrong_password = "abc"

    hashed = hash_password(password)

    print("HASH:", hashed)
    print("CORRECT_PASSWORD:", verify_password(password, hashed))
    print("WRONG_PASSWORD:", verify_password(wrong_password, hashed))


if __name__ == "__main__":
    main()