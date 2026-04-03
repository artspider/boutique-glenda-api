from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.customer_create import CustomerCreate
from app.models.customer import Customer
from app.schemas.customer_update import CustomerUpdate
from app.core.security import get_current_user
from app.models.user import User

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
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    customer = db.get(Customer, customer_id)
    return customer

@router.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return customers

@router.put("/customers/{customer_id}")
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
):
    customer = db.get(Customer, customer_id)

    customer.first_name = payload.first_name
    customer.last_name = payload.last_name
    customer.phone = payload.phone
    customer.address_line = payload.address_line

    db.commit()
    db.refresh(customer)

    return customer

@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    customer.is_active = False

    db.commit()
    db.refresh(customer)

    return customer