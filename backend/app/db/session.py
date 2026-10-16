from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from backend.app.core.config import settings

# Engine configuration
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    # Connect args for sqlite vs postgresql
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    """Dependency for obtaining database sessions per request"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
