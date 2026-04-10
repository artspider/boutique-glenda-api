from pydantic import BaseModel


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str | None = None
    phone: str | None = None
    address_line: str | None = None
    address_reference: str | None = None
    zone: str | None = None
    notes: str | None = None
    email: str | None = None
    credit_limit: float | None = None
    is_active: bool | None = True