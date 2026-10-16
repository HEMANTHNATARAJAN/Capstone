from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from backend.app.schemas.catalog import BookSummary

class CartItemCreate(BaseModel):
    book_id: int
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0)

class CartItemOut(BaseModel):
    id: int
    book_id: int
    quantity: int
    book: BookSummary
    item_total: float

    class Config:
        from_attributes = True

class CartSummary(BaseModel):
    items: List[CartItemOut] = []
    total_items: int = 0
    subtotal: float = 0.0
    tax_amount: float = 0.0
    delivery_fee: float = 0.0
    discount_amount: float = 0.0
    coupon_applied: Optional[str] = None
    grand_total: float = 0.0

class ShippingAddressInput(BaseModel):
    first_name: str
    last_name: str
    address_line: str
    city: str
    state: str
    pin_code: str
    phone: str
    country: str = "India"
    save_address: bool = False

class CheckoutRequest(BaseModel):
    shipping_address: ShippingAddressInput
    payment_method: str = Field("Credit Card", description="Credit Card, Debit Card, UPI, Wallet")
    coupon_code: Optional[str] = None
    use_gift_points: bool = False
    gift_points_to_redeem: int = 0

class OrderItemOut(BaseModel):
    id: int
    book_id: int
    book_title: str
    book_author: str
    book_format: str
    book_cover_image_url: Optional[str] = None
    unit_price: float
    quantity: int
    item_total: float
    tentative_delivery_date: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    order_number: str
    subtotal: float
    tax_amount: float
    delivery_fee: float
    discount_amount: float
    total_amount: float
    payment_method: str
    payment_status: str
    order_status: str
    shipping_address: Any
    placed_at: datetime
    cancellation_deadline: datetime
    can_cancel: bool
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class CancelOrderRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation within 48h"
