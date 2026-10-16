import pytest

@pytest.mark.asyncio
async def test_cart_operations(client):
    # Get a book ID
    resp = await client.get("/api/v1/catalog/books")
    book1 = resp.json()[0]
    book2 = resp.json()[1]

    # 1. Add book 1 to cart
    cart_resp = await client.post(
        "/api/v1/cart/items",
        json={"book_id": book1["id"], "quantity": 1}
    )
    assert cart_resp.status_code == 200
    cart = cart_resp.json()
    assert cart["total_items"] == 1
    assert cart["subtotal"] == book1["price"]

    # 2. Add book 2
    cart_resp2 = await client.post(
        "/api/v1/cart/items",
        json={"book_id": book2["id"], "quantity": 2}
    )
    assert cart_resp2.status_code == 200
    cart2 = cart_resp2.json()
    assert cart2["total_items"] == 3

    # 3. Update quantity using stepper
    item1_id = cart2["items"][0]["id"]
    update_resp = await client.put(
        f"/api/v1/cart/items/{item1_id}",
        json={"quantity": 3}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["total_items"] == 5

    # 4. Remove item
    del_resp = await client.delete(f"/api/v1/cart/items/{item1_id}")
    assert del_resp.status_code == 200

@pytest.mark.asyncio
async def test_coupon_validation(client):
    # Valid coupon
    valid_resp = await client.post(
        "/api/v1/payments/validate-coupon",
        json={"code": "WELCOME100", "order_amount": 500.0}
    )
    assert valid_resp.status_code == 200
    assert valid_resp.json()["valid"] is True
    assert valid_resp.json()["discount_amount"] == 100.0

    # Below minimum
    low_resp = await client.post(
        "/api/v1/payments/validate-coupon",
        json={"code": "WELCOME100", "order_amount": 50.0}
    )
    assert low_resp.status_code == 200
    assert low_resp.json()["valid"] is False

    # Invalid coupon
    inv_resp = await client.post(
        "/api/v1/payments/validate-coupon",
        json={"code": "INVALID_CODE", "order_amount": 500.0}
    )
    assert inv_resp.status_code == 200
    assert inv_resp.json()["valid"] is False
