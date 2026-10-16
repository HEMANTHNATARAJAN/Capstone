from fastapi import Depends, HTTPException, status, Request, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.core.security import decode_session_token
from backend.app.core.config import settings

async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
    bookworm_session: Optional[str] = Cookie(None)
) -> Optional[User]:
    token = None
    # 1. Check Session Cookie
    if bookworm_session:
        token = bookworm_session
    else:
        # 2. Check Authorization Header (Bearer token)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        return None

    user_id = decode_session_token(token)
    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    return user

async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return current_user

def get_session_id(request: Request) -> str:
    """Extract or return client session ID from header/cookie for guest cart management"""
    session_id = request.cookies.get("bookworm_guest_id") or request.headers.get("X-Session-ID")
    if not session_id:
        session_id = "guest_default_session"
    return session_id
