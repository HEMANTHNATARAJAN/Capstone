import pytest_asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from backend.app.main import app
from backend.app.db.base_class import Base
from backend.app.db.session import get_db
from backend.app.db.seed_data import seed_database

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

@pytest_asyncio.fixture(scope="function")
async def client():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize seed data
    from backend.app.db import seed_data
    old_session_maker = seed_data.AsyncSessionLocal
    old_engine = seed_data.engine
    seed_data.AsyncSessionLocal = TestingSessionLocal
    seed_data.engine = test_engine
    await seed_database()

    # Override get_db dependency
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Clean up
    seed_data.AsyncSessionLocal = old_session_maker
    seed_data.engine = old_engine
    app.dependency_overrides.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
