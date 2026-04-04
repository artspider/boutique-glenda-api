from fastapi import APIRouter

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.inventory import InventoryStockResponse
from app.models.inventory_movement import InventoryMovement
from app.schemas.inventory import InventoryMovementResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/test")
def test_inventory():
    return {"message": "inventory module working"}

@router.get("/products/{product_id}/stock", response_model=InventoryStockResponse)
def get_product_stock(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return InventoryStockResponse(
        product_id=product.id,
        product_name=product.name,
        sku=product.sku,
        stock=product.stock,
    )

@router.get("/movements", response_model=list[InventoryMovementResponse])
def get_inventory_movements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    movements = db.query(InventoryMovement).order_by(InventoryMovement.id.desc()).all()
    return movements

@router.get("/products/{product_id}/movements", response_model=list[InventoryMovementResponse])
def get_product_movements(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    movements = (
        db.query(InventoryMovement)
        .filter(InventoryMovement.product_id == product_id)
        .order_by(InventoryMovement.id.desc())
        .all()
    )

    return movements