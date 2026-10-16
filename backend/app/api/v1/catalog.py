from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from backend.app.db.session import get_db
from backend.app.models.catalog import Category, Publisher, Author, Book, Review
from backend.app.models.order import Order, OrderItem
from backend.app.models.user import User
from backend.app.schemas.catalog import (
    CategoryOut, PublisherOut, AuthorOut, BookSummary, BookDetail,
    ReviewCreate, ReviewOut, FilterOptionsOut
)
from backend.app.core.helpers import get_tentative_delivery_date
from backend.app.api.deps import get_current_user_optional, get_current_user

router = APIRouter(prefix="/catalog", tags=["Catalog Subsystem"])

def serialize_book_summary(book: Book) -> BookSummary:
    return BookSummary(
        id=book.id,
        title=book.title,
        subtitle=book.subtitle,
        author_name=book.author.name if book.author else "Unknown Author",
        publisher_name=book.publisher.name if book.publisher else None,
        category_name=book.category.name if book.category else "General",
        category_slug=book.category.slug if book.category else "all",
        format=book.format,
        language=book.language,
        price=book.price,
        original_price=book.original_price,
        description=book.description,
        cover_image_url=book.cover_image_url,
        rating=book.rating,
        rating_count=book.rating_count,
        sales_count=book.sales_count,
        tentative_delivery_date=get_tentative_delivery_date(4),
        is_recommended=book.is_recommended,
        is_bestseller=book.is_bestseller,
        is_new_launch=book.is_new_launch
    )

@router.get("/categories", response_model=List[CategoryOut])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.id))
    return result.scalars().all()

@router.get("/filter-options", response_model=FilterOptionsOut)
async def get_filter_options(db: AsyncSession = Depends(get_db)):
    cats = (await db.execute(select(Category).order_by(Category.id))).scalars().all()
    pubs = (await db.execute(select(Publisher).order_by(Publisher.name))).scalars().all()
    
    return FilterOptionsOut(
        categories=[CategoryOut.model_validate(c) for c in cats],
        languages=["All", "English", "Hindi", "Spanish", "French", "German"],
        formats=["All", "Paperback", "Hardcover", "eBook", "Audiobook"],
        publishers=[PublisherOut.model_validate(p) for p in pubs],
        min_price=0.0,
        max_price=1000.0
    )

@router.get("/books", response_model=List[BookSummary])
async def list_books(
    category: Optional[str] = Query(None, description="Category slug, e.g. 'all', 'self-help', 'mystery'"),
    search: Optional[str] = Query(None, description="Search keyword in title, author, or description"),
    language: Optional[str] = Query(None, description="Filter by language"),
    format: Optional[str] = Query(None, description="Filter by format (Paperback, Hardcover, eBook)"),
    publisher_id: Optional[int] = Query(None, description="Filter by publisher/brand"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("relevance", description="relevance, price_asc, price_desc, rating, newest"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Book).options(
        selectinload(Book.author),
        selectinload(Book.publisher),
        selectinload(Book.category)
    )

    # Category filter
    if category and category.lower() != "all":
        query = query.join(Book.category).where(Category.slug == category.lower())

    # Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.outerjoin(Book.author).where(
            or_(
                Book.title.ilike(term),
                Book.description.ilike(term),
                Author.name.ilike(term)
            )
        )

    # Language filter
    if language and language.lower() != "all":
        query = query.where(Book.language.ilike(language))

    # Format filter
    if format and format.lower() != "all":
        query = query.where(Book.format.ilike(format))

    # Publisher filter
    if publisher_id:
        query = query.where(Book.publisher_id == publisher_id)

    # Price range
    if min_price is not None:
        query = query.where(Book.price >= min_price)
    if max_price is not None:
        query = query.where(Book.price <= max_price)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Book.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Book.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Book.rating))
    elif sort_by == "newest":
        query = query.order_by(desc(Book.created_at))
    else:
        query = query.order_by(desc(Book.sales_count), desc(Book.rating))

    result = await db.execute(query)
    books = result.scalars().all()
    return [serialize_book_summary(b) for b in books]

@router.get("/recommended", response_model=List[BookSummary])
async def get_recommended_books(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Personalized recommendations based on user order history or top featured titles"""
    preferred_category_ids = []
    
    if current_user:
        # Check order history for user's past purchases
        orders_result = await db.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.book))
            .where(Order.user_id == current_user.id)
            .limit(5)
        )
        orders = orders_result.scalars().all()
        for o in orders:
            for item in o.items:
                if item.book and item.book.category_id not in preferred_category_ids:
                    preferred_category_ids.append(item.book.category_id)

    query = select(Book).options(
        selectinload(Book.author),
        selectinload(Book.publisher),
        selectinload(Book.category)
    )

    if preferred_category_ids:
        query = query.where(Book.category_id.in_(preferred_category_ids))
    else:
        query = query.where(or_(Book.is_recommended == True, Book.rating >= 4.8))

    query = query.order_by(desc(Book.rating), desc(Book.sales_count)).limit(6)
    result = await db.execute(query)
    books = result.scalars().all()
    
    # Fallback if list is short
    if len(books) < 3:
        all_books = await db.execute(
            select(Book).options(
                selectinload(Book.author),
                selectinload(Book.publisher),
                selectinload(Book.category)
            ).limit(4)
        )
        books = all_books.scalars().all()

    return [serialize_book_summary(b) for b in books]

@router.get("/bestsellers", response_model=List[BookSummary])
async def get_bestsellers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.author), selectinload(Book.publisher), selectinload(Book.category))
        .where(or_(Book.is_bestseller == True, Book.sales_count >= 800))
        .order_by(desc(Book.sales_count))
        .limit(6)
    )
    return [serialize_book_summary(b) for b in result.scalars().all()]

@router.get("/new-launches", response_model=List[BookSummary])
async def get_new_launches(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(selectinload(Book.author), selectinload(Book.publisher), selectinload(Book.category))
        .where(Book.is_new_launch == True)
        .order_by(desc(Book.created_at))
        .limit(6)
    )
    return [serialize_book_summary(b) for b in result.scalars().all()]

@router.get("/books/{book_id}", response_model=BookDetail)
async def get_book_detail(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(
            selectinload(Book.author),
            selectinload(Book.publisher),
            selectinload(Book.category),
            selectinload(Book.reviews)
        )
        .where(Book.id == book_id)
    )
    book = result.scalars().first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    # Fetch related reads (same category or high rated)
    related_res = await db.execute(
        select(Book)
        .options(selectinload(Book.author), selectinload(Book.publisher), selectinload(Book.category))
        .where(Book.id != book_id, Book.category_id == book.category_id)
        .limit(4)
    )
    related_books = related_res.scalars().all()
    if len(related_books) < 3:
        more_res = await db.execute(
            select(Book)
            .options(selectinload(Book.author), selectinload(Book.publisher), selectinload(Book.category))
            .where(Book.id != book_id)
            .limit(3)
        )
        related_books = more_res.scalars().all()

    summary = serialize_book_summary(book)
    return BookDetail(
        **summary.model_dump(),
        about_author_summary=book.about_author_summary or (book.author.bio if book.author else None),
        back_cover_image_url=book.back_cover_image_url,
        stock_quantity=book.stock_quantity,
        author=AuthorOut.model_validate(book.author) if book.author else AuthorOut(id=0, name="Unknown"),
        publisher=PublisherOut.model_validate(book.publisher) if book.publisher else None,
        reviews=[ReviewOut.model_validate(r) for r in book.reviews],
        related_reads=[serialize_book_summary(rb) for rb in related_books]
    )

@router.post("/books/{book_id}/reviews", response_model=ReviewOut)
async def add_book_review(
    book_id: int,
    review_in: ReviewCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    book = (await db.execute(select(Book).where(Book.id == book_id))).scalars().first()
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    user_name = review_in.user_name or (current_user.full_name if current_user else "Reader")
    new_review = Review(
        book_id=book_id,
        user_id=current_user.id if current_user else None,
        user_name=user_name,
        rating=review_in.rating,
        review_text=review_in.review_text.strip()
    )
    db.add(new_review)
    
    # Update book rating & count
    book.rating_count += 1
    # Simple incremental average
    book.rating = round(((book.rating * (book.rating_count - 1)) + review_in.rating) / book.rating_count, 1)

    await db.commit()
    await db.refresh(new_review)
    return ReviewOut.model_validate(new_review)
