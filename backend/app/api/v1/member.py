from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.app.db.session import get_db
from backend.app.models.user import User, Address
from backend.app.schemas.user import AddressCreate, AddressOut
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/members", tags=["Member & Profile"])

@router.get("/addresses", response_model=List[AddressOut])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Address).where(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    return result.scalars().all()

@router.post("/addresses", response_model=AddressOut)
async def create_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if address_in.is_default:
        # Reset other default addresses
        existing_defaults = await db.execute(
            select(Address).where(Address.user_id == current_user.id, Address.is_default == True)
        )
        for addr in existing_defaults.scalars().all():
            addr.is_default = False

    new_address = Address(
        user_id=current_user.id,
        **address_in.model_dump()
    )
    db.add(new_address)
    await db.commit()
    await db.refresh(new_address)
    return new_address
