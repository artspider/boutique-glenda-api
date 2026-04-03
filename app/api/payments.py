from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.payment_create import PaymentCreate
from app.services.payment_service import PaymentService

router = APIRouter()


@router.post("/payments")
def register_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    service = PaymentService(db)
    return service.register_payment(payload)