from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class PublisherOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    website: Optional[str] = None

    class Config:
        from_attributes = True

class AuthorOut(BaseModel):
    id: int
    name: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    rating: int = Field(5, ge=1, le=5)
    review_text: str = Field(..., max_length=500)
    user_name: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    book_id: int
    user_name: str
    rating: int
    review_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookSummary(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    author_name: str
    publisher_name: Optional[str] = None
    category_name: str
    category_slug: str
    format: str
    language: str
    price: float
    original_price: Optional[float] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    rating: float
    rating_count: int
    sales_count: int
    tentative_delivery_date: str
    is_recommended: bool
    is_bestseller: bool
    is_new_launch: bool

    class Config:
        from_attributes = True

class BookDetail(BookSummary):
    about_author_summary: Optional[str] = None
    back_cover_image_url: Optional[str] = None
    stock_quantity: int
    author: AuthorOut
    publisher: Optional[PublisherOut] = None
    reviews: List[ReviewOut] = []
    related_reads: List[BookSummary] = []

    class Config:
        from_attributes = True

class FilterOptionsOut(BaseModel):
    categories: List[CategoryOut]
    languages: List[str]
    formats: List[str]
    publishers: List[PublisherOut]
    min_price: float
    max_price: float
