from pydantic import BaseModel, Field
from typing import Optional

class ProductCreate(BaseModel):
    name: str = Field(..., example="Blusa de prueba")
    cost_price: float = Field(..., gt=0, example=80.0)
    sale_price: float = Field(..., gt=0, example=100.0)
    stock: Optional[int] = Field(0, ge=0, example=7)
    category_id: Optional[int] = Field(None, example=1)
    sku: Optional[str] = Field(None, example="SKU-001")
    description: Optional[str] = Field(None, example="Producto para prueba manual")
    minimum_stock: Optional[int] = Field(0, ge=0, example=1)