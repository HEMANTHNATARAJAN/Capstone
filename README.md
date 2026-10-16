# 📚 Book Worm — Modern E-Bookstore Platform

A full-stack, AI-augmented e-bookstore platform built with **Python (FastAPI)**, **PostgreSQL / SQLAlchemy 2.0**, and **React (Vite) + Tailwind CSS**, implementing all 12 customer journeys, 6 domain subsystems, OpenAPI 3.0 contracts, and automated test generation.

---

## 🏛️ Architecture & Subsystem Mapping

```
                               ┌────────────────────────────────────────────────────────┐
                               │       Book Worm Frontend (React + Tailwind CSS)       │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │ HTTP / Session Cookies
                                                          ▼
                               ┌────────────────────────────────────────────────────────┐
                               │           FastAPI Gateway (OpenAPI 3.0 Spec)           │
                               └───────┬────────────┬─────────────┬───────────┬─────────┘
                                       │            │             │           │
                 ┌─────────────────────┼────────────┼─────────────┼───────────┴──────────┐
                 ▼                     ▼            ▼             ▼                      ▼
        ┌────────────────┐   ┌────────────────┐   ┌────────────┐   ┌────────────┐   ┌─────────────┐
        │ Member Service │   │ Catalog Service│   │Order & Cart│   │  Payment   │   │  Shipping   │
        │(Auth, Profiles)│   │ (Filter, Recs) │   │(48h Cancel)│   │  (Loyalty) │   │  (Delivery) │
        └────────┬───────┘   └────────┬───────┘   └─────┬──────┘   └─────┬──────┘   └──────┬──────┘
                 │                    │                 │                │                 │
                 └────────────────────┴────────────┬────┴────────────────┴─────────────────┘
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │      PostgreSQL Database Schema        │
                               └────────────────────────────────────────┘
```

---

## ✨ Customer Journeys Supported

1. **E-Store Home:**
   - User authentication (Session cookie-based) & guest browsing.
   - Order history with 1-click **Buy It Again** reordering.
   - Personalized **Recommended for You** based on previous purchase history.
   - Genre and Category sidebar directory (20+ genres).

2. **Catalogue & Product Discovery:**
   - Multi-facet search and filtering (Language, Format: *Paperback, Hardcover, eBook*, Price Range, Sort By).
   - Brand & Publisher filtering (*ABC Publishers, Apex Press, Horizon Books, Starlight Kids*).
   - Dynamic **Tentative Delivery Date calculation** (*e.g., "Delivery by Mon, 21 Jul"*).
   - **Related Reads** recommendation sidebar.
   - Add to Basket with live cart counter.

3. **Payment & Purchase Lifecycle:**
   - Delivery address management with "Use Saved Address" auto-fill.
   - Itemized order total breakdown with tax and free delivery.
   - **Gift Points & Coupon Redemption** (*e.g., WELCOME100, POINTS50*).
   - Multi-tab Payment modal (*Credit Card, Debit Card, UPI, Wallet Points*).
   - Purchase Confirmation modal with green badge and purchased items summary.
   - **48-Hour Order Cancellation Policy:** Allows instant cancellation & refund within 48 hours of order placement.

---

## 📦 Tech Stack

- **Backend:** Python 3.11+ / FastAPI, SQLAlchemy 2.0 Async, Pydantic v2, Uvicorn
- **Database:** PostgreSQL (with SQLite async fallback for instant dev/test runs)
- **Frontend:** React 18, Vite, Tailwind CSS (Dark Mode Design System), Lucide Icons
- **API Spec:** OpenAPI 3.0 (`openapi.json` and `openapi.yaml`)
- **Testing:** Pytest, pytest-asyncio, HTTPX

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.11+ installed
- Node.js 18+ and npm installed

### 2. Backend Setup
```bash
# 1. Activate virtual environment
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS / Linux

# 2. Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# 3. Seed database with wireframe books and demo data
python -m backend.app.db.seed_data

# 4. Start backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Docs: **http://127.0.0.1:8000/docs**
- OpenAPI 3.0 Schema: **http://127.0.0.1:8000/api/v1/openapi.json**

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: **http://127.0.0.1:5173**

---

## 👤 Demo Credentials

| Role | Email | Password | Initial Gift Points |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@bookworm.com` | `password123` | **500 Points (₹500)** |

*You can also click the "Fill Demo Credentials" button in the Login modal.*

---

## 🧪 Running Automated Tests

Run the complete test suite:
```bash
.venv\Scripts\python -m pytest
```

---

## 📄 OpenAPI 3.0 Spec
Standalone API contract specifications are available at:
- `openapi.json`
- `openapi.yaml`
