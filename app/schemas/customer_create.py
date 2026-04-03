from pydantic import BaseModel


class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str | None = None
    address_line: str | None = None