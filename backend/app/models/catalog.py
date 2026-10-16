from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.db.base_class import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    books = relationship("Book", back_populates="category")


class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)

    books = relationship("Book", back_populates="publisher")


class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)

    books = relationship("Book", back_populates="author")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subtitle = Column(String(255), nullable=True)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    publisher_id = Column(Integer, ForeignKey("publishers.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Attributes matching wireframes
    format = Column(String(50), default="Paperback")  # Paperback, Hardcover, eBook, Audiobook
    language = Column(String(50), default="English")
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    about_author_summary = Column(Text, nullable=True)
    
    # Visuals
    cover_image_url = Column(String(500), nullable=True)
    back_cover_image_url = Column(String(500), nullable=True)
    
    # Storefront flags & metrics
    rating = Column(Float, default=4.8)
    rating_count = Column(Integer, default=1)
    sales_count = Column(Integer, default=0)
    stock_quantity = Column(Integer, default=50)
    is_recommended = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_new_launch = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    author = relationship("Author", back_populates="books")
    publisher = relationship("Publisher", back_populates="books")
    category = relationship("Category", back_populates="books")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="book")
    cart_items = relationship("CartItem", back_populates="book")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), nullable=False, default="Reader")
    rating = Column(Integer, nullable=False, default=5)
    review_text = Column(String(500), nullable=False)  # Wireframe has 0/100 or compact text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    book = relationship("Book", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
