from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import Optional
from backend.app.db.session import get_db
from backend.app.models.order import CartItem
from backend.app.models.catalog import Book
from backend.app.models.user import User
from backend.app.schemas.order import CartItemCreate, CartItemUpdate, CartItemOut, CartSummary
from backend.app.api.v1.catalog import serialize_book_summary
from backend.app.api.deps import get_current_user_optional, get_session_id
from backend.app.core.config import settings

router = APIRouter(prefix="/cart", tags=["Cart Subsystem"])

async def calculate_cart_summary(db: AsyncSession, user_id: Optional[int], session_id: str) -> CartSummary:
    query = select(CartItem).options(
        selectinload(CartItem.book).selectinload(Book.author),
        selectinload(CartItem.book).selectinload(Book.publisher),
        selectinload(CartItem.book).selectinload(Book.category)
    )
    if user_id:
        query = query.where(CartItem.user_id == user_id)
    else:
        query = query.where(CartItem.session_id == session_id)

    result = await db.execute(query.order_by(CartItem.created_at))
    cart_items = result.scalars().all()

    items_out = []
    subtotal = 0.0
    total_qty = 0

    for ci in cart_items:
        if not ci.book:
            continue
        item_total = ci.book.price * ci.quantity
        subtotal += item_total
        total_qty += ci.quantity
        
        items_out.append(
            CartItemOut(
                id=ci.id,
                book_id=ci.book_id,
                quantity=ci.quantity,
                book=serialize_book_summary(ci.book),
                item_total=round(item_total, 2)
            )
        )

    # Tax calculation (e.g. 12%)
    tax_amount = round(subtotal * settings.DEFAULT_TAX_RATE, 2) if subtotal > 0 else 0.0
    delivery_fee = 0.0  # Free Delivery as in wireframe
    grand_total = round(subtotal + tax_amount + delivery_fee, 2)

    return CartSummary(
        items=items_out,
        total_items=total_qty,
        subtotal=round(subtotal, 2),
        tax_amount=tax_amount,
        delivery_fee=delivery_fee,
        discount_amount=0.0,
        coupon_applied=None,
        grand_total=grand_total
    )

@router.get("", response_model=CartSummary)
async def get_cart(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    session_id = get_session_id(request)
    user_id = current_user.id if current_user else None
    return await calculate_cart_summary(db, user_id, session_id)

@router.post("/items", response_model=CartSummary)
async def add_to_cart(
    item_in: CartItemCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    book = (await db.execute(select(Book).where(Book.id == item_in.book_id))).scalars().first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    session_id = get_session_id(request)
    user_id = current_user.id if current_user else None

    # Check if item exists in cart
    query = select(CartItem).where(CartItem.book_id == item_in.book_id)
    if user_id:
        query = query.where(CartItem.user_id == user_id)
    else:
        query = query.where(CartItem.session_id == session_id)

    existing_item = (await db.execute(query)).scalars().first()
    if existing_item:
        existing_item.quantity += item_in.quantity
    else:
        new_cart_item = CartItem(
            user_id=user_id,
            session_id=session_id if not user_id else None,
            book_id=item_in.book_id,
            quantity=item_in.quantity
        )
        db.add(new_cart_item)

    await db.commit()
    return await calculate_cart_summary(db, user_id, session_id)

@router.put("/items/{item_id}", response_model=CartSummary)
async def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    session_id = get_session_id(request)
    user_id = current_user.id if current_user else None

    query = select(CartItem).where(CartItem.id == item_id)
    if user_id:
        query = query.where(CartItem.user_id == user_id)
    else:
        query = query.where(CartItem.session_id == session_id)

    item = (await db.execute(query)).scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    if item_update.quantity <= 0:
        await db.delete(item)
    else:
        item.quantity = item_update.quantity

    await db.commit()
    return await calculate_cart_summary(db, user_id, session_id)

@router.delete("/items/{item_id}", response_model=CartSummary)
async def remove_cart_item(
    item_id: int,
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    session_id = get_session_id(request)
    user_id = current_user.id if current_user else None

    query = select(CartItem).where(CartItem.id == item_id)
    if user_id:
        query = query.where(CartItem.user_id == user_id)
    else:
        query = query.where(CartItem.session_id == session_id)

    item = (await db.execute(query)).scalars().first()
    if item:
        await db.delete(item)
        await db.commit()

    return await calculate_cart_summary(db, user_id, session_id)

@router.delete("/clear")
async def clear_cart(
    request: Request,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    session_id = get_session_id(request)
    user_id = current_user.id if current_user else None

    if user_id:
        await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
    else:
        await db.execute(delete(CartItem).where(CartItem.session_id == session_id))
    
    await db.commit()
    return {"message": "Cart cleared"}
