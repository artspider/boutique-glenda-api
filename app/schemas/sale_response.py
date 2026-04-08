from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SaleCustomerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class SaleProductResponse(BaseModel):
    id: int
    name: str
    sku: str

    model_config = ConfigDict(from_attributes=True)


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product: SaleProductResponse

    model_config = ConfigDict(from_attributes=True)


class SaleResponse(BaseModel):
    id: int
    customer_id: int | None = None
    user_id: int
    total_amount: float
    status: str
    created_at: datetime
    customer: SaleCustomerResponse | None = None
    items: list[SaleItemResponse] = []

    model_config = ConfigDict(from_attributes=True)