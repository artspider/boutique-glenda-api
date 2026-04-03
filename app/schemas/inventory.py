from pydantic import BaseModel
from datetime import datetime


class InventoryStockResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str | None
    stock: int

class InventoryMovementResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    movement_type: str
    created_at: datetime

    class Config:
        from_attributes = True