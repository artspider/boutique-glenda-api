from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.credit import Credit
from app.core.security import get_current_user
from app.models.user import User
from app.models.payment_schedule import PaymentSchedule
from app.schemas.credit_response import CreditResponse
from app.schemas.payment_schedule_response import PaymentScheduleResponse

router = APIRouter(prefix="/credits", tags=["credits"])

@router.get("/active", response_model=list[CreditResponse])
def get_active_credits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    credits = db.query(Credit).filter(Credit.balance > 0).all()
    return credits

@router.get("/upcoming-payments", response_model=list[PaymentScheduleResponse])
def get_upcoming_payments(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    payments = (
        db.query(PaymentSchedule)
        .filter(PaymentSchedule.status == "pending")
        .order_by(PaymentSchedule.due_date.asc())
        .all()
    )
    return payments

@router.get("/{credit_id}", response_model=CreditResponse)
def get_credit(
    credit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    credit = db.get(Credit, credit_id)
    return credit

@router.get("/", response_model=list[CreditResponse])
def list_credits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    credits = db.query(Credit).all()
    return credits

