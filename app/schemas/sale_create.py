from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class SaleCreate(BaseModel):
    customer_id: int
    user_id: int
    payment_type: str
    items: List[SaleItemCreate]

    is_credit: bool = False

    down_payment: Optional[Decimal] = None
    number_of_payments: Optional[int] = None
    payment_frequency: Optional[str] = None