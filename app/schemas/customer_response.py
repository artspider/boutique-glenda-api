from pydantic import BaseModel, ConfigDict
from typing import Optional


class CustomerResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    address_line: Optional[str] = None
    address_reference: Optional[str] = None
    zone: Optional[str] = None
    notes: Optional[str] = None
    credit_limit: Optional[float] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class CustomerListItem(BaseModel):
    id: int
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

