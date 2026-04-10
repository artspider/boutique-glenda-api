from pydantic import BaseModel


class CustomerUpdate(BaseModel):
    first_name: str
    last_name: str | None = None
    phone: str
    address_line: str | None = None
    address_reference: str | None = None
    zone: str | None = None
    notes: str | None = None
    email: str | None = None
    credit_limit: float | None = None
    is_active: bool | None = None