from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid

from backend.app.db.session import get_db
from backend.app.models.order import Order, OrderItem, CartItem
from backend.app.models.catalog import Book
from backend.app.models.user import User, Address
from backend.app.models.payment import Coupon, GiftPointTransaction
from backend.app.schemas.order import (
    CheckoutRequest, OrderOut, OrderItemOut, CancelOrderRequest
)
from backend.app.api.deps import get_current_user, get_session_id
from backend.app.core.helpers import get_tentative_delivery_date
from backend.app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Order Subsystem"])

def check_can_cancel(order: Order) -> bool:
    if order.order_status != "Confirmed":
        return False
    now = datetime.now(timezone.utc)
    # Ensure timezone aware comparison
    deadline = order.cancellation_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    return now <= deadline

def serialize_order_out(order: Order) -> OrderOut:
    items_out = []
    for item in order.items:
        items_out.append(
            OrderItemOut(
                id=item.id,
                book_id=item.book_id,
                book_title=item.book.title if item.book else "Book",
                book_author=item.book.author.name if item.book and item.book.author else "Author",
                book_format=item.book.format if item.book else "Paperback",
                book_cover_image_url=item.book.cover_image_url if item.book else None,
                unit_price=item.unit_price,
                quantity=item.quantity,
                item_total=round(item.unit_price * item.quantity, 2),
                tentative_delivery_date=item.tentative_delivery_date or get_tentative_delivery_date(settings.DEFAULT_DELIVERY_DAYS)
            )
        )
    
    return OrderOut(
        id=order.id,
        order_number=order.order_number,
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        delivery_fee=order.delivery_fee,
        discount_amount=order.discount_amount,
        total_amount=order.total_amount,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        shipping_address=order.shipping_address,
        placed_at=order.placed_at,
        cancellation_deadline=order.cancellation_deadline,
        can_cancel=check_can_cancel(order),
        cancelled_at=order.cancelled_at,
        cancellation_reason=order.cancellation_reason,
        items=items_out
    )

@router.post("/checkout", response_model=OrderOut)
async def checkout(
    checkout_req: CheckoutRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    session_id = get_session_id(request)
    
    # 1. Fetch Cart Items
    cart_res = await db.execute(
        select(CartItem)
        .options(selectinload(CartItem.book).selectinload(Book.author))
        .where(CartItem.user_id == current_user.id)
    )
    cart_items = cart_res.scalars().all()
    
    # If empty, check guest items transferred
    if not cart_items:
        guest_res = await db.execute(
            select(CartItem)
            .options(selectinload(CartItem.book).selectinload(Book.author))
            .where(CartItem.session_id == session_id)
        )
        cart_items = guest_res.scalars().all()

    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your shopping cart is empty"
        )

    # 2. Calculate Pricing
    subtotal = sum(item.book.price * item.quantity for item in cart_items if item.book)
    tax_amount = round(subtotal * settings.DEFAULT_TAX_RATE, 2)
    delivery_fee = 0.0  # Free Delivery
    discount_amount = 0.0

    # Coupon validation
    if checkout_req.coupon_code:
        code = checkout_req.coupon_code.strip().upper()
        coupon_res = await db.execute(
            select(Coupon).where(Coupon.code == code, Coupon.is_active == True)
        )
        coupon = coupon_res.scalars().first()
        if coupon and subtotal >= coupon.min_order_amount:
            discount_amount += coupon.discount_amount

    # Gift points redemption
    if checkout_req.use_gift_points and checkout_req.gift_points_to_redeem > 0:
        points_to_use = min(checkout_req.gift_points_to_redeem, current_user.gift_points_balance)
        # 1 point = ₹1
        point_discount = float(points_to_use)
        discount_amount += point_discount
        
        # Deduct points from user
        current_user.gift_points_balance -= points_to_use
        gpt = GiftPointTransaction(
            user_id=current_user.id,
            points=-points_to_use,
            description="Redeemed on order checkout"
        )
        db.add(gpt)

    total_amount = max(0.0, round(subtotal + tax_amount + delivery_fee - discount_amount, 2))

    # 3. Save Address if requested
    addr_dict = checkout_req.shipping_address.model_dump()
    if checkout_req.shipping_address.save_address:
        new_addr = Address(
            user_id=current_user.id,
            first_name=checkout_req.shipping_address.first_name,
            last_name=checkout_req.shipping_address.last_name,
            address_line=checkout_req.shipping_address.address_line,
            city=checkout_req.shipping_address.city,
            state=checkout_req.shipping_address.state,
            pin_code=checkout_req.shipping_address.pin_code,
            phone=checkout_req.shipping_address.phone,
            country=checkout_req.shipping_address.country,
            is_default=True
        )
        db.add(new_addr)

    # 4. Create Order
    now = datetime.now(timezone.utc)
    order_num = f"BW-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    deadline = now + timedelta(hours=settings.ORDER_CANCELLATION_HOURS)

    new_order = Order(
        order_number=order_num,
        user_id=current_user.id,
        subtotal=round(subtotal, 2),
        tax_amount=tax_amount,
        delivery_fee=delivery_fee,
        discount_amount=round(discount_amount, 2),
        total_amount=total_amount,
        payment_method=checkout_req.payment_method,
        payment_status="Completed",
        order_status="Confirmed",
        shipping_address=addr_dict,
        placed_at=now,
        cancellation_deadline=deadline
    )
    db.add(new_order)
    await db.flush()

    # 5. Create Order Items & Update Book sales count
    for ci in cart_items:
        if not ci.book:
            continue
        order_item = OrderItem(
            order_id=new_order.id,
            book_id=ci.book_id,
            quantity=ci.quantity,
            unit_price=ci.book.price,
            tentative_delivery_date=f"Delivery by {get_tentative_delivery_date(settings.DEFAULT_DELIVERY_DAYS)}"
        )
        db.add(order_item)
        ci.book.sales_count += ci.quantity

    # 6. Clear Cart
    await db.execute(delete(CartItem).where(CartItem.user_id == current_user.id))
    if session_id:
        await db.execute(delete(CartItem).where(CartItem.session_id == session_id))

    await db.commit()

    # Re-fetch order with items
    order_loaded = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.book).selectinload(Book.author))
        .where(Order.id == new_order.id)
    )
    return serialize_order_out(order_loaded.scalars().first())

@router.get("/history", response_model=List[OrderOut])
async def list_order_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.book).selectinload(Book.author))
        .where(Order.user_id == current_user.id)
        .order_by(desc(Order.placed_at))
    )
    orders = result.scalars().all()
    return [serialize_order_out(o) for o in orders]

@router.get("/{order_id}", response_model=OrderOut)
async def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.book).selectinload(Book.author))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return serialize_order_out(order)

@router.post("/{order_id}/cancel", response_model=OrderOut)
async def cancel_order(
    order_id: int,
    cancel_req: CancelOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Enforces the 48-hour order cancellation policy window"""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.book).selectinload(Book.author))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.order_status == "Cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already cancelled")

    now = datetime.now(timezone.utc)
    deadline = order.cancellation_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    if now > deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be cancelled after the {settings.ORDER_CANCELLATION_HOURS}-hour policy window"
        )

    order.order_status = "Cancelled"
    order.payment_status = "Refunded"
    order.cancelled_at = now
    order.cancellation_reason = cancel_req.reason

    # Refund gift points if any were used
    if order.discount_amount > 0:
        current_user.gift_points_balance += 100
        refund_gpt = GiftPointTransaction(
            user_id=current_user.id,
            points=100,
            description=f"Points refunded for cancelled order {order.order_number}"
        )
        db.add(refund_gpt)

    await db.commit()
    return serialize_order_out(order)

@router.post("/{order_id}/buy-again")
async def buy_it_again(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """1-Click Buy It Again re-populates user's cart with items from past order"""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    for item in order.items:
        # Check existing cart item
        cart_res = await db.execute(
            select(CartItem).where(
                CartItem.user_id == current_user.id,
                CartItem.book_id == item.book_id
            )
        )
        existing = cart_res.scalars().first()
        if existing:
            existing.quantity += item.quantity
        else:
            new_ci = CartItem(
                user_id=current_user.id,
                book_id=item.book_id,
                quantity=item.quantity
            )
            db.add(new_ci)

    await db.commit()
    return {"message": "Items added to cart successfully", "order_number": order.order_number}
