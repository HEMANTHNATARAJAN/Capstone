import asyncio
import urllib.parse
from sqlalchemy import select
from backend.app.db.session import AsyncSessionLocal, engine
from backend.app.db.base_class import Base
from backend.app.models.user import User, Address
from backend.app.models.catalog import Category, Publisher, Author, Book, Review
from backend.app.models.payment import Coupon
from backend.app.core.security import get_password_hash

def make_svg_cover(title: str, author: str, bg_color: str, text_color: str, subtitle: str = "", icon_type: str = "book"):
    # Generate inline SVG Data URI for exact wireframe representation
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450">
  <defs>
    <linearGradient id="g_{bg_color.replace('#','')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg_color}" />
      <stop offset="100%" stop-color="{bg_color}" stop-opacity="0.85" />
    </linearGradient>
  </defs>
  <rect width="300" height="450" rx="12" fill="url(#g_{bg_color.replace('#','')})"/>
  <rect x="15" y="15" width="270" height="420" rx="8" fill="none" stroke="{text_color}" stroke-opacity="0.15" stroke-width="2"/>
  
  <text x="150" y="70" text-anchor="middle" fill="{text_color}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" letter-spacing="1">
    {title.upper()}
  </text>
  
  <text x="150" y="100" text-anchor="middle" fill="{text_color}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" opacity="0.8">
    {subtitle}
  </text>

  <!-- Centered Icon / Abstract Emblem -->
  <g transform="translate(150, 230)">
    <circle cx="0" cy="0" r="50" fill="none" stroke="{text_color}" stroke-width="4" stroke-opacity="0.8"/>
    <circle cx="0" cy="0" r="30" fill="none" stroke="{text_color}" stroke-width="3" stroke-opacity="0.6"/>
    <circle cx="0" cy="0" r="10" fill="{text_color}" opacity="0.9"/>
  </g>

  <!-- Author Name -->
  <rect x="40" y="360" width="220" height="40" rx="6" fill="{text_color}" fill-opacity="0.12"/>
  <text x="150" y="385" text-anchor="middle" fill="{text_color}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="0.5">
    {author.upper()}
  </text>
</svg>"""
    encoded = urllib.parse.quote(svg)
    return f"data:image/svg+xml;utf8,{encoded}"

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Category))
        if result.scalars().first():
            print("Database already seeded.")
            return

        print("Seeding database with wireframe entities...")

        # 1. Categories matching the wireframe sidebar
        genres = [
            ("All", "all", "Browse full bookstore catalog"),
            ("Romance", "romance", "Heartwarming stories and romantic sagas"),
            ("Mystery", "mystery", "Thrilling whodunits and detective stories"),
            ("Science Fiction", "science-fiction", "Futuristic worlds and space exploration"),
            ("Fantasy", "fantasy", "Mythical realms and epic adventures"),
            ("Historical", "historical", "Engaging journeys through past eras"),
            ("Biography", "biography", "Inspiring lives of prominent leaders and thinkers"),
            ("Self-help", "self-help", "Personal development and productivity mastery"),
            ("Memoir", "memoir", "Firsthand personal accounts and reflections"),
            ("Travel", "travel", "Guides and wanderlust memoirs"),
            ("Cooking", "cooking", "Culinary arts and recipes"),
            ("Children's", "childrens", "Delightful reads for young minds"),
            ("Young Adult", "young-adult", "Coming-of-age fiction and adventure"),
            ("Comics & Graphic Novels", "comics-graphic-novels", "Illustrated narratives"),
            ("Poetry", "poetry", "Verses and lyrical anthologies"),
            ("Drama", "drama", "Theatrical plays and intense drama"),
            ("Science", "science", "Popular science, astronomy, and discoveries"),
            ("Philosophy", "philosophy", "Deep inquiries into life and ethics"),
            ("Religion", "religion", "Spiritual traditions and theology"),
            ("Language Learning", "language-learning", "Linguistics and foreign language mastery"),
        ]
        
        cat_map = {}
        for name, slug, desc in genres:
            cat = Category(name=name, slug=slug, description=desc)
            session.add(cat)
            cat_map[name] = cat
        await session.flush()

        # 2. Publishers
        publishers = [
            Publisher(name="ABC Publishers", description="Leading non-fiction & wellness publisher", website="https://abcpublishers.example.com"),
            Publisher(name="Apex Press", description="Fiction and thriller imprint", website="https://apexpress.example.com"),
            Publisher(name="Horizon Books", description="Science fiction and academic publisher", website="https://horizonbooks.example.com"),
            Publisher(name="Starlight Kids", description="Children's literature imprint", website="https://starlightkids.example.com"),
        ]
        session.add_all(publishers)
        await session.flush()

        # 3. Authors
        authors_data = [
            Author(name="Daniel Reed", bio="Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco. With a passion for intentional living, Daniel has dedicated his career to helping individuals simplify their lives—one habit, one space, and one thought at a time.", photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"),
            Author(name="Arjun Patel", bio="Arjun Patel is a renowned behavioral strategist specializing in deep work, focus mastery, and digital decluttering.", photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"),
            Author(name="Raj Patel", bio="Raj Patel is a cognitive psychologist exploring lifelong learning systems and intellectual agility.", photo_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80"),
            Author(name="James Wright", bio="James Wright is an executive coach and bestselling author on high performance and career resilience.", photo_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80"),
            Author(name="James Adams", bio="James Adams is a mystery and thriller novelist celebrated for haunting atmospheric tales.", photo_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80"),
            Author(name="Jessica Martin", bio="Jessica Martin writes bestselling contemporary romance and emotional dramas that touch millions.", photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80"),
            Author(name="Laura Mitchell", bio="Laura Mitchell is an astrophysicist and hard science fiction author whose works explore humanity's future among the stars.", photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"),
            Author(name="Clara Nelson", bio="Clara Nelson is a gothic mystery writer known for suspenseful domestic thrillers and eerie architectural puzzles.", photo_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80"),
            Author(name="Emily Parker", bio="Emily Parker is an illustrator and children's story creator known for heartwarming tales of friendship and adventure.", photo_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80"),
        ]
        session.add_all(authors_data)
        await session.flush()
        auth_map = {a.name: a for a in authors_data}

        # 4. Books (Directly mapped to wireframe images & data)
        books_data = [
            # Recommended for You
            Book(
                title="The Art of Focus",
                subtitle="Practical guide to mastering focus & boosting productivity",
                author_id=auth_map["Arjun Patel"].id,
                publisher_id=publishers[0].id,
                category_id=cat_map["Self-help"].id,
                format="Paperback",
                language="English",
                price=399.0,
                original_price=499.0,
                description="Practical guide to mastering focus and boosting productivity every day in a hyper-distracted world.",
                about_author_summary="Arjun Patel shares tested strategies for deep cognitive work and eliminating mental friction.",
                cover_image_url=make_svg_cover("The Art of Focus", "Arjun Patel", "#ffffff", "#d93829", "Focus Mastery", "target"),
                rating=4.9,
                rating_count=210,
                sales_count=520,
                is_recommended=True,
                is_bestseller=False,
                is_new_launch=False
            ),
            Book(
                title="The Art of Learning",
                subtitle="Master the mindset and methods for effective lifelong learning",
                author_id=auth_map["Raj Patel"].id,
                publisher_id=publishers[0].id,
                category_id=cat_map["Self-help"].id,
                format="Paperback",
                language="English",
                price=259.0,
                original_price=320.0,
                description="Master the mindset and methods for effective lifelong learning and rapid skill acquisition.",
                about_author_summary="Raj Patel deconstructs how top performers acquire, refine, and retain complex skills.",
                cover_image_url=make_svg_cover("The Art of Learning", "Raj Patel", "#d82b27", "#ffffff", "Mindset & Methods", "book"),
                rating=4.8,
                rating_count=180,
                sales_count=430,
                is_recommended=True,
                is_bestseller=False,
                is_new_launch=False
            ),
            Book(
                title="The Path to Success",
                subtitle="A practical guide to achieving goals with clarity and confidence",
                author_id=auth_map["James Wright"].id,
                publisher_id=publishers[0].id,
                category_id=cat_map["Self-help"].id,
                format="Paperback",
                language="English",
                price=359.0,
                original_price=450.0,
                description="A practical guide to achieving goals with clarity, relentless focus, and authentic confidence.",
                about_author_summary="James Wright breaks down actionable habits used by global entrepreneurs to achieve mastery.",
                cover_image_url=make_svg_cover("The Path to Success", "James Wright", "#0d828a", "#ffffff", "Clarity & Confidence", "star"),
                rating=4.9,
                rating_count=320,
                sales_count=780,
                is_recommended=True,
                is_bestseller=False,
                is_new_launch=False
            ),

            # Bestsellers this Month
            Book(
                title="The Midnight Hour",
                subtitle="Haunting tale of a man's journey & the shadows of a forgotten past",
                author_id=auth_map["James Adams"].id,
                publisher_id=publishers[1].id,
                category_id=cat_map["Mystery"].id,
                format="Paperback",
                language="English",
                price=299.0,
                original_price=399.0,
                description="A haunting tale of a man's journey and the shadows of a forgotten past in a coastal lighthouse village.",
                about_author_summary="James Adams brings readers on a suspenseful journey through psychological tension and dark lore.",
                cover_image_url=make_svg_cover("The Midnight Hour", "James Adams", "#1b3842", "#8ce4ec", "Gothic Mystery", "moon"),
                rating=4.7,
                rating_count=410,
                sales_count=1120,
                is_recommended=False,
                is_bestseller=True,
                is_new_launch=False
            ),
            Book(
                title="Beneath the Stars",
                subtitle="A heartwarming tale where two souls discover what they truly need",
                author_id=auth_map["Jessica Martin"].id,
                publisher_id=publishers[1].id,
                category_id=cat_map["Romance"].id,
                format="Hardcover",
                language="English",
                price=499.0,
                original_price=599.0,
                description="A heartwarming contemporary romance where two souls discover what they truly need in the midst of life's chaos.",
                about_author_summary="Jessica Martin crafts unforgettable love stories filled with depth, humor, and emotional truth.",
                cover_image_url=make_svg_cover("Beneath the Stars", "Jessica Martin", "#28234a", "#f0a28e", "Love & Drama", "heart"),
                rating=4.9,
                rating_count=520,
                sales_count=1450,
                is_recommended=False,
                is_bestseller=True,
                is_new_launch=False
            ),
            Book(
                title="The Final Frontier",
                subtitle="A mission to space secrets to change humanity forever",
                author_id=auth_map["Laura Mitchell"].id,
                publisher_id=publishers[2].id,
                category_id=cat_map["Science Fiction"].id,
                format="Paperback",
                language="English",
                price=359.0,
                original_price=420.0,
                description="A daring crew embarks on a mission to uncover deep space anomalies that will redefine human consciousness.",
                about_author_summary="Laura Mitchell combines real astrophysics with gripping narrative pacing.",
                cover_image_url=make_svg_cover("The Final Frontier", "Laura Mitchell", "#142540", "#f9ca24", "Space Epic", "rocket"),
                rating=4.8,
                rating_count=340,
                sales_count=890,
                is_recommended=False,
                is_bestseller=True,
                is_new_launch=False
            ),

            # New Launches
            Book(
                title="Joy of Minimalism",
                subtitle="Declutter your life to uncover peace, clarity, and joy",
                author_id=auth_map["Daniel Reed"].id,
                publisher_id=publishers[0].id,
                category_id=cat_map["Self-help"].id,
                format="Paperback",
                language="English",
                price=149.0,
                original_price=249.0,
                description="In The Joy of Minimalism, Daniel Reed guides you through practical strategies to declutter your mind, space, and schedule. Whether you're overwhelmed, over-committed, or just over it—this book offers a calm, mindful approach to building a simpler, more fulfilling life.",
                about_author_summary="Daniel Reed is a writer, minimalist, and productivity coach based in San Francisco.",
                cover_image_url=make_svg_cover("The Joy of Minimalism", "Daniel Reed", "#ffd23f", "#111111", "Simplify your life for clarity", "sun"),
                back_cover_image_url=make_svg_cover("Joy of Minimalism Back", "Daniel Reed", "#fbf1c7", "#111111", "Synopsis & Praise", "barcode"),
                rating=5.0,
                rating_count=145,
                sales_count=145,
                is_recommended=False,
                is_bestseller=False,
                is_new_launch=True
            ),
            Book(
                title="The Vanishing House",
                subtitle="A chilling mystery unfolds within a house that disappears",
                author_id=auth_map["Clara Nelson"].id,
                publisher_id=publishers[1].id,
                category_id=cat_map["Mystery"].id,
                format="eBook",
                language="English",
                price=99.0,
                original_price=149.0,
                description="A chilling thriller unfolding within an ancient manor that vanishes from memory and map coordinates.",
                about_author_summary="Clara Nelson is celebrated for unpredictable plot twists and rich gothic atmosphere.",
                cover_image_url=make_svg_cover("The Vanishing House", "Clara Nelson", "#1e392a", "#d1fae5", "Chilling Mystery", "house"),
                rating=4.6,
                rating_count=190,
                sales_count=620,
                is_recommended=False,
                is_bestseller=False,
                is_new_launch=True
            ),
            Book(
                title="The Lost Kitten",
                subtitle="A heartwarming tale of courage, friendship, and feline adventure",
                author_id=auth_map["Emily Parker"].id,
                publisher_id=publishers[3].id,
                category_id=cat_map["Children's"].id,
                format="Hardcover",
                language="English",
                price=339.0,
                original_price=399.0,
                description="A heartwarming adventure of courage, friendship, and feline curiosity through the enchanted forest.",
                about_author_summary="Emily Parker illustrates joyful picture books beloved by parents and children worldwide.",
                cover_image_url=make_svg_cover("The Lost Kitten", "Emily Parker", "#f97316", "#ffffff", "Heartwarming Adventure", "cat"),
                rating=4.9,
                rating_count=230,
                sales_count=480,
                is_recommended=False,
                is_bestseller=False,
                is_new_launch=True
            ),
        ]
        session.add_all(books_data)
        await session.flush()

        # 5. Reviews for "Joy of Minimalism" (from Wireframe)
        minimalism_book = next(b for b in books_data if b.title == "Joy of Minimalism")
        reviews = [
            Review(
                book_id=minimalism_book.id,
                user_name="John Smith",
                rating=5,
                review_text="The accordion component delivers large amounts of content in a small space through progressive disclosure. The user gets key details about the underlying content and can choose to expand that content within the constraints of the accordion."
            ),
            Review(
                book_id=minimalism_book.id,
                user_name="Sarah Connor",
                rating=5,
                review_text="Transformational read! Helped me clear my desk and prioritize high-leverage habits."
            ),
        ]
        session.add_all(reviews)

        # 6. Users & Addresses
        demo_user = User(
            email="customer@bookworm.com",
            hashed_password=get_password_hash("password123"),
            full_name="John Doe",
            role="customer",
            gift_points_balance=500
        )
        session.add(demo_user)
        await session.flush()

        demo_address = Address(
            user_id=demo_user.id,
            first_name="John",
            last_name="Doe",
            address_line="Flat 402, Highline Residency, Park Avenue",
            city="Bengaluru",
            state="Karnataka",
            pin_code="560001",
            phone="9876543210",
            country="India",
            is_default=True
        )
        session.add(demo_address)

        # 7. Coupons / Gift Points
        coupons = [
            Coupon(code="WELCOME100", discount_amount=100.0, min_order_amount=200.0, description="₹100 Off on your first order"),
            Coupon(code="POINTS50", discount_amount=50.0, min_order_amount=100.0, description="₹50 Instant Gift Points Redemption"),
            Coupon(code="SUMMER20", discount_amount=80.0, min_order_amount=300.0, description="₹80 Festive Book Discount"),
        ]
        session.add_all(coupons)

        await session.commit()
        print("Database successfully seeded with Book Worm wireframe catalog!")

if __name__ == "__main__":
    asyncio.run(seed_database())
