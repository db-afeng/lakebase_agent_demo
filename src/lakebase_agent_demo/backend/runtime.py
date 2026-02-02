from databricks.sdk import WorkspaceClient
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from .config import AppConfig
from .database import create_engine, create_session_maker
from .logger import logger


class Runtime:
    def __init__(self, config: AppConfig) -> None:
        self.config = config
        self._engine: AsyncEngine | None = None
        self._session_maker: async_sessionmaker[AsyncSession] | None = None

    @property
    def ws(self) -> WorkspaceClient:
        # note - this workspace client is usually an SP-based client
        # in development it usually uses the DATABRICKS_CONFIG_PROFILE
        return WorkspaceClient()

    def init_database(self) -> None:
        """Initialize database connection pool."""
        if self.config.database_url:
            self._engine = create_engine(self.config)
            self._session_maker = create_session_maker(self._engine)
            logger.info(f"Database initialized: {self.config.db_host}")
        else:
            logger.warning("Database not configured - API endpoints will be unavailable")

    async def close_database(self) -> None:
        """Close database connection pool."""
        if self._engine:
            await self._engine.dispose()
            logger.info("Database connection pool closed")

    @property
    def engine(self) -> AsyncEngine | None:
        return self._engine

    @property
    def session_maker(self) -> async_sessionmaker[AsyncSession] | None:
        return self._session_maker

    @property
    def has_database(self) -> bool:
        return self._engine is not None
