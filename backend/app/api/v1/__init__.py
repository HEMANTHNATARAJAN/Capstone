from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.member import router as member_router
from backend.app.api.v1.catalog import router as catalog_router
from backend.app.api.v1.shipping import router as shipping_router
from backend.app.api.v1.cart import router as cart_router
from backend.app.api.v1.order import router as order_router
from backend.app.api.v1.payment import router as payment_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(member_router)
api_v1_router.include_router(catalog_router)
api_v1_router.include_router(shipping_router)
api_v1_router.include_router(cart_router)
api_v1_router.include_router(order_router)
api_v1_router.include_router(payment_router)
