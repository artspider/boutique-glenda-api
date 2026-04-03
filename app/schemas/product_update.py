from pydantic import BaseModel, Field
from typing import Optional

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, example="Blusa actualizada")
    cost_price: Optional[float] = Field(None, gt=0, example=80.0)
    sale_price: Optional[float] = Field(None, gt=0, example=100.0)
    stock: Optional[int] = Field(None, ge=0, example=10)
    category_id: Optional[int] = Field(None, example=1)
    description: Optional[str] = Field(None, example="Producto actualizado")
    minimum_stock: Optional[int] = Field(None, ge=0, example=1)