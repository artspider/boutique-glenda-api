from pydantic import BaseModel


class CustomerUpdate(BaseModel):
    first_name: str
    last_name: str | None = None
    phone: str
    address_line: str | None = None