from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.app.db.session import get_db
from backend.app.models.payment import Coupon
from backend.app.models.user import User
from backend.app.schemas.payment import CouponApplyRequest, CouponApplyResponse, PaymentMethodOut
from backend.app.api.deps import get_current_user_optional

router = APIRouter(prefix="/payments", tags=["Payment & Coupon Subsystem"])

@router.get("/methods", response_model=List[PaymentMethodOut])
async def get_payment_methods():
    return [
        PaymentMethodOut(id="credit_card", name="Credit Card", description="Visa, MasterCard, Amex, RuPay", icon="credit-card"),
        PaymentMethodOut(id="debit_card", name="Debit Card", description="All major banks supported", icon="credit-card-alt"),
        PaymentMethodOut(id="upi", name="UPI", description="Google Pay, PhonePe, Paytm, BHIM", icon="smartphone"),
        PaymentMethodOut(id="wallet", name="Wallet & Gift Points", description="Redeem loyalty points balance", icon="wallet"),
    ]

@router.post("/validate-coupon", response_model=CouponApplyResponse)
async def validate_coupon(
    coupon_req: CouponApplyRequest,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    code = coupon_req.code.strip().upper()
    result = await db.execute(select(Coupon).where(Coupon.code == code, Coupon.is_active == True))
    coupon = result.scalars().first()

    if not coupon:
        return CouponApplyResponse(
            valid=False,
            code=code,
            discount_amount=0.0,
            message="Invalid or expired coupon code"
        )

    if coupon_req.order_amount < coupon.min_order_amount:
        return CouponApplyResponse(
            valid=False,
            code=code,
            discount_amount=0.0,
            message=f"Minimum order amount for this coupon is ₹{coupon.min_order_amount:.2f}"
        )

    return CouponApplyResponse(
        valid=True,
        code=code,
        discount_amount=coupon.discount_amount,
        message=f"Coupon applied! You saved ₹{coupon.discount_amount:.2f}"
    )
