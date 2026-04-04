from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.payment_create import PaymentCreate
from app.services.payment_service import PaymentService
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()


@router.post("/payments")
def register_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentService(db)
    return service.register_payment(payload)