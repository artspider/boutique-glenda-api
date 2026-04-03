from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.customer_create import CustomerCreate
from app.models.customer import Customer
from app.schemas.customer_update import CustomerUpdate
from app.core.security import get_current_user
from app.models.user import User
from app.models.credit import Credit
from app.schemas.customer_response import CustomerResponse
from app.schemas.customer_response import CustomerResponse, CustomerListItem

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/")
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

#@router.get("/customers/{customer_id}")
@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
#def get_customer(customer_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    customer = db.get(Customer, customer_id)
    return customer

@router.get("/", response_model=list[CustomerListItem])
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return customers

@router.put("/{customer_id}")
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

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    customer.is_active = False

    db.commit()
    db.refresh(customer)

    return customer

@router.get("/{customer_id}/account")
def get_customer_account(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.get(Customer, customer_id)
    credits = db.query(Credit).filter(Credit.customer_id == customer_id).all()
    total_debt = sum(credit.balance for credit in credits)

    return {
        "customer": customer,
        "credits": credits,
        "total_debt": total_debt,
        "active_credits": [credit for credit in credits if credit.balance > 0],
        "pending_balance": total_debt,
    }