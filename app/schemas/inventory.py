from typing import Literal

from pydantic import BaseModel, Field
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
    reference: str | None = None
    notes: str | None = None
    product_name: str | None = None
    sku: str | None = None
    user_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class InventoryListItemResponse(BaseModel):
    product_id: int
    name: str
    sku: str | None
    category: str | None
    stock: int
    minimum_stock: int
    is_active: bool
    last_movement_at: datetime | None
    status: Literal['healthy', 'low_stock', 'out_of_stock', 'inactive']


class InventoryMovementCreate(BaseModel):
    product_id: int
    movement_type: Literal['in', 'out', 'adjustment']
    quantity: int = Field(..., gt=0)
    reference: str | None = None
    notes: str | None = None
