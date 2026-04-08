from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.sale_create import SaleCreate
from app.services.sale_service import SaleService
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.sale_response import SaleResponse



#router = APIRouter()
router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


@router.post("/")
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SaleService(db)
    return service.create_sale(payload)

@router.get("/", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = SaleService(db)
    return service.get_sales()