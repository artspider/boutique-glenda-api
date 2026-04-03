from decimal import Decimal
from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    credit_id: int
    user_id: int
    amount: Decimal = Field(gt=0)