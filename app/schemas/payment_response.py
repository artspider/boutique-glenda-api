from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PaymentResponse(BaseModel):
    id: int
    credit_id: int
    user_id: int
    amount: float
    payment_method: str
    reference: str | None
    paid_at: datetime

    model_config = ConfigDict(from_attributes=True)