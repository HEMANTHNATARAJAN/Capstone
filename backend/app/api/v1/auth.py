from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User, Address
from backend.app.schemas.user import UserCreate, UserLogin, UserOut, AuthResponse
from backend.app.core.security import verify_password, get_password_hash, create_session_token
from backend.app.core.config import settings
from backend.app.api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/auth", tags=["Member & Authentication"])

@router.post("/register", response_model=AuthResponse)
async def register(
    user_in: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="customer",
        gift_points_balance=500  # Welcome gift points
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_session_token(new_user.id)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        samesite="lax",
        secure=False  # Localhost dev
    )

    # Re-fetch with addresses
    result = await db.execute(
        select(User).options(selectinload(User.addresses)).where(User.id == new_user.id)
    )
    user_loaded = result.scalars().first()
    return AuthResponse(message="Account created successfully", user=UserOut.model_validate(user_loaded))

@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).options(selectinload(User.addresses)).where(User.email == credentials.email)
    )
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_session_token(user.id)
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.SESSION_EXPIRE_HOURS * 3600,
        samesite="lax",
        secure=False
    )

    return AuthResponse(message="Login successful", user=UserOut.model_validate(user))

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(settings.SESSION_COOKIE_NAME)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).options(selectinload(User.addresses)).where(User.id == current_user.id)
    )
    user = result.scalars().first()
    return UserOut.model_validate(user)
