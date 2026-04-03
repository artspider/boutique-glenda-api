from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class PaymentSchedule(Base):
    __tablename__ = "payment_schedules"

    id = Column(Integer, primary_key=True, index=True)

    credit_id = Column(Integer, ForeignKey("credits.id"), nullable=False)

    installment_number = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    amount_due = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pending")

    credit = relationship("Credit")