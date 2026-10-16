import pytest

@pytest.mark.asyncio
async def test_auth_login_and_me(client):
    # 1. Login with demo user
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "customer@bookworm.com", "password": "password123"}
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "user" in data
    assert data["user"]["email"] == "customer@bookworm.com"
    assert data["user"]["gift_points_balance"] == 500

    # 2. Get profile with session cookie
    me_resp = await client.get("/api/v1/auth/me")
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "customer@bookworm.com"

@pytest.mark.asyncio
async def test_auth_register_new_user(client):
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Alice Wonderland",
            "email": "alice@example.com",
            "password": "secretpassword"
        }
    )
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["full_name"] == "Alice Wonderland"
    assert data["user"]["gift_points_balance"] == 500

@pytest.mark.asyncio
async def test_member_addresses(client):
    # Login first
    await client.post(
        "/api/v1/auth/login",
        json={"email": "customer@bookworm.com", "password": "password123"}
    )

    # Get addresses
    addr_resp = await client.get("/api/v1/members/addresses")
    assert addr_resp.status_code == 200
    addresses = addr_resp.json()
    assert len(addresses) >= 1

    # Add new address
    new_addr_resp = await client.post(
        "/api/v1/members/addresses",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "address_line": "123 Tech Park, Indiranagar",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pin_code": "560038",
            "phone": "9988776655",
            "country": "India",
            "is_default": True
        }
    )
    assert new_addr_resp.status_code == 200
    assert new_addr_resp.json()["city"] == "Bengaluru"
