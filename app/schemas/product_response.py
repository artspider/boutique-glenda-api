from pydantic import BaseModel, ConfigDict
from typing import Optional


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    description: Optional[str] = None
    cost_price: float
    sale_price: float
    stock: int
    minimum_stock: int
    category_id: Optional[int] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)