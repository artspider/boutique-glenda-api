from datetime import date
from pydantic import BaseModel, ConfigDict


class PaymentScheduleResponse(BaseModel):
    id: int
    credit_id: int
    installment_number: int
    due_date: date
    amount_due: float
    status: str

    model_config = ConfigDict(from_attributes=True)