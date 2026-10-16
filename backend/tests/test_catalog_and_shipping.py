import pytest

@pytest.mark.asyncio
async def test_get_categories(client):
    resp = await client.get("/api/v1/catalog/categories")
    assert resp.status_code == 200
    categories = resp.json()
    assert len(categories) >= 15
    slugs = [c["slug"] for c in categories]
    assert "self-help" in slugs
    assert "mystery" in slugs
    assert "romance" in slugs

@pytest.mark.asyncio
async def test_list_books_and_filters(client):
    # 1. All books
    resp = await client.get("/api/v1/catalog/books")
    assert resp.status_code == 200
    books = resp.json()
    assert len(books) >= 8

    # 2. Filter by category
    resp_sh = await client.get("/api/v1/catalog/books?category=self-help")
    assert resp_sh.status_code == 200
    sh_books = resp_sh.json()
    assert len(sh_books) >= 3
    for b in sh_books:
        assert b["category_slug"] == "self-help"

    # 3. Search filter
    resp_search = await client.get("/api/v1/catalog/books?search=Minimalism")
    assert resp_search.status_code == 200
    search_books = resp_search.json()
    assert len(search_books) == 1
    assert "Minimalism" in search_books[0]["title"]

    # 4. Format filter
    resp_format = await client.get("/api/v1/catalog/books?format=eBook")
    assert resp_format.status_code == 200
    ebooks = resp_format.json()
    assert len(ebooks) >= 1
    assert ebooks[0]["format"] == "eBook"

@pytest.mark.asyncio
async def test_book_detail_and_reviews(client):
    # Get all books first to find ID
    resp = await client.get("/api/v1/catalog/books?search=Joy of Minimalism")
    book_id = resp.json()[0]["id"]

    # Fetch detail
    detail_resp = await client.get(f"/api/v1/catalog/books/{book_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["title"] == "Joy of Minimalism"
    assert "author" in detail
    assert "related_reads" in detail
    assert len(detail["related_reads"]) > 0

    # Add review
    review_resp = await client.post(
        f"/api/v1/catalog/books/{book_id}/reviews",
        json={
            "rating": 5,
            "review_text": "Remarkable book! Highly practical and concise.",
            "user_name": "Test Reader"
        }
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["user_name"] == "Test Reader"

@pytest.mark.asyncio
async def test_shipping_delivery_estimate(client):
    resp = await client.get("/api/v1/shipping/estimate-delivery")
    assert resp.status_code == 200
    data = resp.json()
    assert "Delivery by" in data["tentative_delivery_date"]
    assert data["is_free_delivery"] is True
