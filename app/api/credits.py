from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.credit import Credit

router = APIRouter()


@router.get("/credits/{credit_id}")
def get_credit(credit_id: int, db: Session = Depends(get_db)):
    credit = db.get(Credit, credit_id)
    return credit