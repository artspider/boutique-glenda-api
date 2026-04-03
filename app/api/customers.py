from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.customer_create import CustomerCreate
from app.models.customer import Customer

router = APIRouter()


@router.post("/customers")
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        address_line=payload.address_line,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer

@router.get("/customers/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    return customer