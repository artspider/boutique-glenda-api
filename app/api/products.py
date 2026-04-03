import time
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product_create import ProductCreate
from typing import List
from app.schemas.product_response import ProductResponse
from app.schemas.product_update import ProductUpdate

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

from app.schemas.product_create import ProductCreate

@router.post("/", response_model=dict)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):

    # Generar SKU si no se proporciona
    sku = product.sku
    if not sku:
        import time, random
        sku = f"SKU-{int(time.time())}-{random.randint(1000,9999)}"

    # Validación de negocio crítica
    if product.sale_price < product.cost_price:
        raise HTTPException(
            status_code=400,
            detail="sale_price cannot be less than cost_price"
        )

    # Crear objeto Product
    db_product = Product(
        name=product.name,
        cost_price=product.cost_price,
        sale_price=product.sale_price,
        stock=product.stock,
        category_id=product.category_id,
        sku=sku,
        description=product.description,
        minimum_stock=product.minimum_stock or 0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return {
        "id": db_product.id,
        "name": db_product.name,
        "sku": db_product.sku,
        "description": db_product.description,
        "minimum_stock": db_product.minimum_stock
    }

@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

@router.put("/{product_id}", response_model=dict)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validación de negocio: solo si se envían ambos precios
    if product.sale_price is not None and product.cost_price is not None:
        if product.sale_price < product.cost_price:
            raise HTTPException(
                status_code=400,
                detail="sale_price cannot be less than cost_price"
            )

    # Actualización de campos si se proporcionan
    if product.name is not None:
        db_product.name = product.name
    if product.cost_price is not None:
        db_product.cost_price = product.cost_price
    if product.sale_price is not None:
        db_product.sale_price = product.sale_price
    if product.stock is not None:
        db_product.stock = product.stock
    if product.category_id is not None:
        db_product.category_id = product.category_id
    if product.description is not None:
        db_product.description = product.description
    if product.minimum_stock is not None:
        db_product.minimum_stock = product.minimum_stock

    db.commit()
    db.refresh(db_product)
    return {
        "id": db_product.id,
        "name": db_product.name,
        "sku": db_product.sku,
        "description": db_product.description,
        "minimum_stock": db_product.minimum_stock
    }

from fastapi import HTTPException

@router.delete("/{product_id}", response_model=dict)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Baja lógica: desactivar producto
    db_product.is_active = False

    db.commit()
    db.refresh(db_product)
    return {
        "id": db_product.id,
        "name": db_product.name,
        "sku": db_product.sku,
        "is_active": db_product.is_active
    }