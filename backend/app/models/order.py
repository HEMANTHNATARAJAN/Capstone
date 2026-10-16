from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from backend.app.db.base_class import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)  # For guest cart
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="cart_items")
    book = relationship("Book", back_populates="cart_items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Financial breakdown
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    
    # Payment & Status
    payment_method = Column(String(50), default="Credit Card")  # Credit Card, Debit Card, UPI, Wallet
    payment_status = Column(String(50), default="Completed")  # Completed, Refunded, Failed
    order_status = Column(String(50), default="Confirmed")  # Confirmed, Cancelled, Shipped, Delivered
    
    # Shipping info snapshot
    shipping_address = Column(JSON, nullable=True)
    
    # Timing & 48-Hour Cancellation Window
    placed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    cancellation_deadline = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc) + timedelta(hours=48)
    )
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    tentative_delivery_date = Column(String(50), nullable=True)  # e.g., "Mon, 21 Jul"

    order = relationship("Order", back_populates="items")
    book = relationship("Book", back_populates="order_items")
