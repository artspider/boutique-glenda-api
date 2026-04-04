from pydantic import BaseModel
from app.schemas.customer_response import CustomerResponse
from app.schemas.credit_response import CreditSummary


class CustomerAccountResponse(BaseModel):
    customer: CustomerResponse
    credits: list[CreditSummary]
    total_debt: float
    active_credits: list[CreditSummary]
    pending_balance: float