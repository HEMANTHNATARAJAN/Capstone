# Book Worm E-Bookstore Platform Plan

## Top-Level Overview
Develop an end-to-end modern online bookstore platform named **Book Worm** using **Python (FastAPI)**, **PostgreSQL**, and **React (Vite) + Tailwind CSS**, featuring session-based authentication, catalog browsing with dynamic delivery estimates, order history recommendations, points/coupon redemption, multi-method payment modal, and a 48-hour order cancellation window.

The implementation is broken into independent, verifiable sub-tasks. Each phase requires explicit confirmation before execution.

---

## Sub-Tasks

### Sub-Task 1: PostgreSQL Data Model Design & Database Scaffolding
- **Intent:** Establish the relational database schema, database configuration, connection handling, and seed scripts with sample wireframe data.
- **Expected Outcomes:**
  - PostgreSQL database connection and session management configured via SQLAlchemy 2.0 async engine.
  - Relational models created for Users, Addresses, Categories, Publishers/Authors, Books, Reviews, Cart Items, Orders, Order Items, and Gift Points/Coupons.
  - Seed script (`backend/seed.py`) with all sample books (*"The Art of Focus"*, *"The Art of Learning"*, *"The Path to Success"*, *"The Midnight Hour"*, *"Beneath the Stars"*, *"Joy of Minimalism"*, etc.) and demo user profiles.
- **Todo List:**
  - [ ] Initialize backend project structure and requirements (`backend/requirements.txt`)
  - [ ] Implement database connection and base models in `backend/app/db/`
  - [ ] Define domain models in `backend/app/models/` (Member, Catalog, Order, Payment, Shipping)
  - [ ] Create database initialization and data seeding script (`backend/app/db/seed_data.py`)
- **Relevant Context:** PostgreSQL relational schema, wireframe data entities, session store.
- **Status:** `[x] done`

---

### Sub-Task 2: OpenAPI 3.0 Contract & FastAPI Backend Subsystems
- **Intent:** Build RESTful backend API services with OpenAPI 3.0 compliance, secure session cookies, business logic for delivery estimation, order history recommendations, and 48-hour order cancellation.
- **Expected Outcomes:**
  - Session cookie authentication endpoints (`/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`).
  - Catalog endpoints for categories, multi-facet filtering (search, language, format, price, sort), product details with author bios and reviews, and order-history-based recommendations.
  - Shipping delivery date estimation endpoint (`/api/v1/shipping/estimate-delivery`).
  - Cart and checkout endpoints with coupon/gift points discount calculations.
  - Order management endpoints with order history, 1-click "Buy It Again", and 48-hour cancellation policy validation.
  - Auto-generated OpenAPI 3.0 schema and Swagger UI (`/docs`).
- **Todo List:**
  - [ ] Create FastAPI application entrypoint and middleware in `backend/app/main.py`
  - [ ] Implement Pydantic schemas for request/response validation in `backend/app/schemas/`
  - [ ] Implement Member subsystem (Auth & Addresses) in `backend/app/api/v1/member.py`
  - [ ] Implement Catalog subsystem (Categories, Books, Recommendations, Reviews) in `backend/app/api/v1/catalog.py`
  - [ ] Implement Shipping subsystem (Delivery date calculation) in `backend/app/api/v1/shipping.py`
  - [ ] Implement Order & Cart subsystem (Cart, Checkout, 48hr Cancel, Buy It Again) in `backend/app/api/v1/order.py`
  - [ ] Implement Payment & Coupon subsystem in `backend/app/api/v1/payment.py`
  - [ ] Export OpenAPI 3.0 specification (`openapi.json` / `openapi.yaml`)
- **Relevant Context:** Subsystem architecture (Member, Store, Catalog, Order, Payment, Shipping), OpenAPI 3.0 specs.
- **Status:** `[x] done`

---

### Sub-Task 3: React + Vite + Tailwind CSS Frontend Development
- **Intent:** Build the responsive "Book Worm" dark-themed frontend application matching all provided wireframes and connecting to the backend API.
- **Expected Outcomes:**
  - Tailwind CSS dark theme setup with custom palette, typography, badges, and layout components.
  - Header with search, multi-facet filters (Language, Format, Price, Sort), cart badge counter, and user profile indicator.
  - Category navigation sidebar with all genres.
  - Landing page with "Recommended for You", "Bestsellers this Month", and "New Launches" carousels.
  - Product Detail Page (PDP) with dual cover preview, price, tentative delivery date, "Add to Cart", "Add to Wishlist", author spotlight, reviews section (0/100 char limit + star rating), and "Related Reads" sidebar.
  - Shopping Cart & Checkout view with item quantity steppers (`- 1 +`), delivery address form with "Use Saved Address" toggle, and order summary breakdown with gift points redemption.
  - Payment Modal with multi-method selector (Credit Card, Debit Card, UPI, Wallet) and formatted card fields.
  - Purchase Confirmation Modal with green success badge, purchased items list, and "Continue your Shopping" button.
  - My Orders screen with 48-hour countdown timer, "Cancel Order" action, and "Buy It Again" 1-click reorder.
- **Todo List:**
  - [ ] Scaffold React + Vite application with Tailwind CSS in `frontend/`
  - [ ] Set up state management and API client (Axios/Fetch with credentials) in `frontend/src/services/`
  - [ ] Build shared UI components (Navbar, Sidebar, BookCard, RatingStars, Modal) in `frontend/src/components/`
  - [ ] Implement Storefront / Catalog page (`frontend/src/pages/HomePage.jsx` & `CatalogPage.jsx`)
  - [ ] Implement Product Detail page (`frontend/src/pages/ProductDetailPage.jsx`)
  - [ ] Implement Checkout & Address page (`frontend/src/pages/CheckoutPage.jsx`)
  - [ ] Implement Payment Modal & Success Modal (`frontend/src/components/PaymentModal.jsx`, `SuccessModal.jsx`)
  - [ ] Implement My Orders page with 48h cancellation & reordering (`frontend/src/pages/OrdersPage.jsx`)
- **Relevant Context:** Book Worm wireframes, customer journeys 1-12, Tailwind CSS dark design system.
- **Status:** `[x] done`

---

### Sub-Task 4: AI-Augmented Automated Test Suite
- **Intent:** Create automated end-to-end API test scenarios and business logic verification suites (ICA-style test generators).
- **Expected Outcomes:**
  - Automated test suite validating all customer journeys and domain edge cases using `pytest`.
  - Test coverage for authentication, catalog filtering, points redemption, 48-hour cancellation rule enforcement, and reorder workflow.
- **Todo List:**
  - [ ] Set up test environment and fixtures (`backend/tests/conftest.py`)
  - [ ] Implement API test cases for Member & Catalog subsystems (`backend/tests/test_catalog.py`)
  - [ ] Implement API test cases for Cart, Checkout, and Points redemption (`backend/tests/test_cart_checkout.py`)
  - [ ] Implement business rule tests for 48-hour order cancellation & "Buy It Again" (`backend/tests/test_order_lifecycle.py`)
- **Relevant Context:** Test scenario generator, API test cases, business rule verification.
- **Status:** `[x] done`

---

### Sub-Task 5: Local Deployment & Documentation
- **Intent:** Ensure one-step local execution readiness with environment templates, seed verification, and clear execution documentation.
- **Expected Outcomes:**
  - Environment templates (`.env.example`).
  - Comprehensive `README.md` with step-by-step instructions for running database, backend server, and frontend development server.
- **Todo List:**
  - [ ] Create root environment configurations and setup scripts
  - [ ] Verify end-to-end flow locally (backend + frontend + database)
  - [ ] Document project architecture, API routes, and local run guide in `README.md`
- **Relevant Context:** Local machine readiness, environment configuration.
- **Status:** `[x] done`
