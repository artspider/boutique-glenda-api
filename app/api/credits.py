from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.credit import Credit
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/credits/{credit_id}")
def get_credit(credit_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    credit = db.get(Credit, credit_id)
    return credit