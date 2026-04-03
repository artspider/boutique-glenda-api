from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.sale_create import SaleCreate
from app.services.sale_service import SaleService

router = APIRouter()


@router.post("/sales")
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    service = SaleService(db)
    return service.create_sale(payload)