from fastapi import APIRouter
from backend.app.schemas.shipping import DeliveryEstimateOut
from backend.app.core.helpers import get_tentative_delivery_date
from backend.app.core.config import settings

router = APIRouter(prefix="/shipping", tags=["Shipping Subsystem"])

@router.get("/estimate-delivery", response_model=DeliveryEstimateOut)
async def estimate_delivery():
    """Calculates approximate delivery date and shipping fees"""
    return DeliveryEstimateOut(
        tentative_delivery_date=f"Delivery by {get_tentative_delivery_date(settings.DEFAULT_DELIVERY_DAYS)}",
        estimated_days=settings.DEFAULT_DELIVERY_DAYS,
        delivery_fee=0.0,
        free_delivery_threshold=0.0,
        is_free_delivery=True
    )
