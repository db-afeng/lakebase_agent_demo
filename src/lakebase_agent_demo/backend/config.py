from importlib import resources
from pathlib import Path
from typing import ClassVar
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from .._metadata import app_name, app_slug

# project root is the parent of the src folder
project_root = Path(__file__).parent.parent.parent.parent
env_file = project_root / ".env"

if env_file.exists():
    load_dotenv(dotenv_path=env_file)


class AppConfig(BaseSettings):
    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=env_file, env_prefix=f"{app_slug.upper()}_", extra="ignore"
    )
    app_name: str = Field(default=app_name)

    # Database settings for Lakebase PostgreSQL
    db_host: str = Field(default="")
    db_port: int = Field(default=5432)
    db_name: str = Field(default="databricks_postgres")
    db_user: str = Field(default="")
    db_password: str = Field(default="")
    db_sslmode: str = Field(default="require")

    @property
    def static_assets_path(self) -> Path:
        return Path(str(resources.files(app_slug))).joinpath("__dist__")

    @property
    def database_url(self) -> str:
        """Build async PostgreSQL connection URL for SQLAlchemy."""
        if not self.db_host or not self.db_user:
            return ""
        password = quote_plus(self.db_password) if self.db_password else ""
        return (
            f"postgresql+psycopg://{self.db_user}:{password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
            f"?sslmode={self.db_sslmode}"
        )

    @property
    def database_url_sync(self) -> str:
        """Build sync PostgreSQL connection URL for Alembic migrations."""
        if not self.db_host or not self.db_user:
            return ""
        password = quote_plus(self.db_password) if self.db_password else ""
        return (
            f"postgresql+psycopg://{self.db_user}:{password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
            f"?sslmode={self.db_sslmode}"
        )
