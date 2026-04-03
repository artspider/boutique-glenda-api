import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def main() -> None:
    db = SessionLocal()
    try:
        email = "admin@boutiqueglenda.com"
        existing_user = db.scalar(select(User).where(User.email == email))

        if existing_user:
            print("USER_ALREADY_EXISTS")
            return

        user = User(
            email=email,
            full_name="Admin Boutique Glenda",
            hashed_password=hash_password("123456"),
            role="admin",
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print("USER_CREATED")
        print(f"ID: {user.id}")
        print(f"EMAIL: {user.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()