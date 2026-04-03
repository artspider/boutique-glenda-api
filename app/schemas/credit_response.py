from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CreditResponse(BaseModel):
    id: int
    sale_id: int
    customer_id: int
    total_amount: float
    down_payment: float
    financed_amount: float
    balance: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)