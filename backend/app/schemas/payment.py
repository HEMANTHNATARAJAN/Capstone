from pydantic import BaseModel
from typing import Optional, List

class CouponApplyRequest(BaseModel):
    code: str
    order_amount: float

class CouponApplyResponse(BaseModel):
    valid: bool
    code: str
    discount_amount: float
    message: str

class PaymentMethodOut(BaseModel):
    id: str
    name: str
    description: str
    icon: str
