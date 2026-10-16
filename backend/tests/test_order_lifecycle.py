import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from backend.app.models.order import Order

@pytest.mark.asyncio
async def test_full_checkout_and_48hr_cancellation(client):
    # 1. Login
    await client.post(
        "/api/v1/auth/login",
        json={"email": "customer@bookworm.com", "password": "password123"}
    )

    # 2. Add books to cart
    resp = await client.get("/api/v1/catalog/books")
    books = resp.json()
    book1 = books[0]
    book2 = books[1]

    await client.post("/api/v1/cart/items", json={"book_id": book1["id"], "quantity": 1})
    await client.post("/api/v1/cart/items", json={"book_id": book2["id"], "quantity": 1})

    # 3. Checkout with coupon WELCOME100 & gift points
    checkout_payload = {
        "shipping_address": {
            "first_name": "John",
            "last_name": "Doe",
            "address_line": "Flat 402, Highline Residency",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560001",
            "phone": "9876543210",
            "country": "India",
            "save_address": False
        },
        "payment_method": "Credit Card",
        "coupon_code": "WELCOME100",
        "use_gift_points": True,
        "gift_points_to_redeem": 100
    }

    order_resp = await client.post("/api/v1/orders/checkout", json=checkout_payload)
    assert order_resp.status_code == 200
    order_data = order_resp.json()
    order_id = order_data["id"]

    assert order_data["order_status"] == "Confirmed"
    assert order_data["discount_amount"] == 200.0  # 100 coupon + 100 points
    assert order_data["can_cancel"] is True
    assert len(order_data["items"]) == 2

    # 4. View Order History
    hist_resp = await client.get("/api/v1/orders/history")
    assert hist_resp.status_code == 200
    orders = hist_resp.json()
    assert len(orders) >= 1
    assert orders[0]["id"] == order_id

    # 5. Cancel Order within 48 hours (Valid)
    cancel_resp = await client.post(
        f"/api/v1/orders/{order_id}/cancel",
        json={"reason": "Customer changed reading priority within 48h"}
    )
    assert cancel_resp.status_code == 200
    cancelled_data = cancel_resp.json()
    assert cancelled_data["order_status"] == "Cancelled"
    assert cancelled_data["payment_status"] == "Refunded"
    assert cancelled_data["can_cancel"] is False

    # 6. Test Buy It Again
    buy_again_resp = await client.post(f"/api/v1/orders/{order_id}/buy-again")
    assert buy_again_resp.status_code == 200
    
    # Check that cart is re-populated
    cart_resp = await client.get("/api/v1/cart")
    assert cart_resp.status_code == 200
    assert cart_resp.json()["total_items"] == 2
