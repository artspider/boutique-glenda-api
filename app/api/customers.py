from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.customer_service import CustomerService

from app.schemas.customer_create import CustomerCreate
from app.schemas.customer_update import CustomerUpdate
from app.schemas.customer_response import CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


"""
=========================================================
Customers API
---------------------------------------------------------
Responsabilidades:
- recibir requests HTTP
- validar entrada con schemas
- delegar lógica al service
- retornar respuestas tipadas
=========================================================
"""


@router.get("/", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.get_all_customers()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.get_customer_by_id(customer_id)


@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED
)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.create_customer(customer_data)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db)
):
    service = CustomerService(db)
    return service.update_customer(customer_id, customer_data)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    service = CustomerService(db)
    service.delete_customer(customer_id)