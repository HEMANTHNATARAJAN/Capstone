from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json

from backend.app.core.config import settings
from backend.app.api.v1 import api_v1_router
from backend.app.db.session import engine
from backend.app.db.base_class import Base
from backend.app.db.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo catalog
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="Book Worm E-Bookstore API",
    description="""
    OpenAPI 3.0 specification for Book Worm E-Bookstore platform.
    Features:
    - Member authentication & address profiles
    - Storefront catalog with genre filtering, authors, and reviews
    - Dynamic delivery date estimation
    - Shopping cart & coupon/gift points redemption
    - Order checkout & 48-hour order cancellation window
    - 1-Click 'Buy It Again' reordering
    """,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
