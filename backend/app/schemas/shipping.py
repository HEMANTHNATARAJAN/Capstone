from pydantic import BaseModel
from typing import Optional

class DeliveryEstimateOut(BaseModel):
    tentative_delivery_date: str  # E.g., "Mon, 21 Jul"
    estimated_days: int
    delivery_fee: float
    free_delivery_threshold: float
    is_free_delivery: bool
