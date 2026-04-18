from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.models.product_category import ProductCategory
from app.models.inventory_movement import InventoryMovement
from app.schemas.inventory import (
    InventoryListItemResponse,
    InventoryMovementCreate,
    InventoryMovementResponse,
    InventoryStockResponse,
)
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def _get_inventory_status(product: Product) -> str:
    if not product.is_active:
        return "inactive"
    if product.stock <= 0:
        return "out_of_stock"
    if product.stock <= product.minimum_stock:
        return "low_stock"
    return "healthy"


def _serialize_movement(movement: InventoryMovement) -> InventoryMovementResponse:
    return InventoryMovementResponse(
        id=movement.id,
        product_id=movement.product_id,
        quantity=movement.quantity,
        movement_type=movement.movement_type,
        reference=movement.reference,
        notes=movement.notes,
        product_name=movement.product.name if movement.product else None,
        sku=movement.product.sku if movement.product else None,
        user_name=movement.user.full_name if movement.user else None,
        created_at=movement.created_at,
    )

@router.get("/test")
def test_inventory():
    return {"message": "inventory module working"}

@router.get("/items", response_model=list[InventoryListItemResponse])
def list_inventory_items(
    include_inactive: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    del current_user

    last_movement_subquery = (
        db.query(
            InventoryMovement.product_id.label("product_id"),
            func.max(InventoryMovement.created_at).label("last_movement_at"),
        )
        .group_by(InventoryMovement.product_id)
        .subquery()
    )

    query = (
        db.query(Product, ProductCategory.name, last_movement_subquery.c.last_movement_at)
        .outerjoin(ProductCategory, Product.category_id == ProductCategory.id)
        .outerjoin(
            last_movement_subquery,
            Product.id == last_movement_subquery.c.product_id,
        )
        .order_by(Product.name.asc())
    )

    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))

    rows = query.all()

    return [
        InventoryListItemResponse(
            product_id=product.id,
            name=product.name,
            sku=product.sku,
            category=category_name,
            stock=product.stock,
            minimum_stock=product.minimum_stock,
            is_active=product.is_active,
            last_movement_at=last_movement_at,
            status=_get_inventory_status(product),
        )
        for product, category_name, last_movement_at in rows
    ]

@router.get("/products/{product_id}/stock", response_model=InventoryStockResponse)
def get_product_stock(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    del current_user

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
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    del current_user

    movements = (
        db.query(InventoryMovement)
        .order_by(InventoryMovement.id.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_movement(movement) for movement in movements]

@router.get("/products/{product_id}/movements", response_model=list[InventoryMovementResponse])
def get_product_movements(
    product_id: int,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    del current_user

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    movements = (
        db.query(InventoryMovement)
        .filter(InventoryMovement.product_id == product_id)
        .order_by(InventoryMovement.id.desc())
        .limit(limit)
        .all()
    )

    return [_serialize_movement(movement) for movement in movements]


@router.post("/movements", response_model=InventoryMovementResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_movement(
    payload: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.movement_type == "in":
        product.stock += payload.quantity
        movement_quantity = payload.quantity
    elif payload.movement_type == "out":
        if product.stock < payload.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuficiente para '{product.name}'. "
                    f"Disponible: {product.stock}, solicitado: {payload.quantity}."
                ),
            )
        product.stock -= payload.quantity
        movement_quantity = payload.quantity
    else:
        movement_quantity = payload.quantity - product.stock
        product.stock = payload.quantity

    movement = InventoryMovement(
        product_id=product.id,
        user_id=current_user.id,
        movement_type=payload.movement_type,
        quantity=movement_quantity,
        reference=(payload.reference or "").strip() or None,
        notes=(payload.notes or "").strip() or None,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return _serialize_movement(movement)
