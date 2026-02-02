"""Async database connection management for Lakebase PostgreSQL."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .config import AppConfig


def create_engine(config: AppConfig) -> AsyncEngine:
    """Create an async SQLAlchemy engine for Lakebase PostgreSQL."""
    if not config.database_url:
        raise ValueError(
            "Database URL not configured. "
            "Set LAKEBASE_AGENT_DEMO_DB_HOST and LAKEBASE_AGENT_DEMO_DB_USER environment variables."
        )

    return create_async_engine(
        config.database_url,
        echo=False,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )


def create_session_maker(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    """Create an async session maker bound to the engine."""
    return async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


@asynccontextmanager
async def get_session(
    session_maker: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    """Context manager for database sessions with automatic cleanup."""
    session = session_maker()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
