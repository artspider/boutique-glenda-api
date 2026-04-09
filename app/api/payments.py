from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.payment_create import PaymentCreate
from app.services.payment_service import PaymentService
from app.models.user import User
from app.core.security import get_current_user
from app.models.payment import Payment
from app.schemas.payment_response import PaymentResponse

router = APIRouter()


@router.post("/payments")
def register_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PaymentService(db)
    return service.register_payment(payload)

@router.get("/payments", response_model=list[PaymentResponse])
def list_payments(
    credit_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Payment)

    if credit_id is not None:
        query = query.filter(Payment.credit_id == credit_id)

    payments = query.order_by(Payment.paid_at.desc()).all()
    return payments