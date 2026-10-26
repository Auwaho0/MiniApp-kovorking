from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings

_url = settings.DATABASE_URL
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _url.startswith("postgresql://"):
    _url = _url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(_url, echo=False, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session