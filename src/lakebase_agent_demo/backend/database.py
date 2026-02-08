"""Async database connection management for Lakebase PostgreSQL."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .config import AppConfig
from .lakebase_credentials import _is_oauth_mode, get_password_for_connection


def _inject_oauth_password_on_connect(dialect: object, conn_rec: object, cargs: object, cparams: dict) -> None:
    """DialectEvents.do_connect: set password from current OAuth token (for token refresh)."""
    cparams["password"] = get_password_for_connection()


def create_engine(config: AppConfig) -> AsyncEngine:
    """Create an async SQLAlchemy engine for Lakebase PostgreSQL."""
    if not config.database_url:
        raise ValueError(
            "Database URL not configured. "
            "Set LAKEBASE_AGENT_DEMO_DB_HOST and LAKEBASE_AGENT_DEMO_DB_USER environment variables."
        )

    engine = create_async_engine(
        config.database_url,
        echo=False,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )

    if _is_oauth_mode():
        event.listens_for(engine.sync_engine, "do_connect")(_inject_oauth_password_on_connect)

    return engine


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
