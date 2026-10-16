from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AddressBase(BaseModel):
    first_name: str
    last_name: str
    address_line: str
    city: str
    state: str
    pin_code: str
    phone: str
    country: str = "India"
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressOut(AddressBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: str
    gift_points_balance: int
    created_at: datetime
    addresses: List[AddressOut] = []

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    message: str
    user: UserOut
