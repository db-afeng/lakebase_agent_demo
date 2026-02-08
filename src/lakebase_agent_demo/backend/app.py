from contextlib import asynccontextmanager
from importlib import resources

from alembic import command
from alembic.config import Config
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .._metadata import app_name, app_slug, dist_dir
from .config import AppConfig
from .router import api
from .runtime import Runtime
from .utils import add_not_found_handler
from .logger import logger


def _run_migrations(config: AppConfig) -> None:
    """Run Alembic migrations to head when DB is configured."""
    if not config.database_url_sync:
        return
    script_location = str(
        resources.files(app_slug).joinpath("backend", "migrations")
    )
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", script_location)
    try:
        command.upgrade(alembic_cfg, "head")
        logger.info("Alembic migrations applied successfully")
    except Exception as e:
        logger.exception("Alembic upgrade failed: %s", e)
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize config and runtime, store in app.state for dependency injection
    config = AppConfig()
    logger.info(f"Starting app with configuration:\n{config}")

    _run_migrations(config)

    runtime = Runtime(config)
    runtime.init_database()

    # Store in app.state for access via dependencies
    app.state.config = config
    app.state.runtime = runtime

    yield

    # Cleanup
    await runtime.close_database()


app = FastAPI(title=f"{app_name}", lifespan=lifespan)
ui = StaticFiles(directory=dist_dir, html=True)

# note the order of includes and mounts!
app.include_router(api)
app.mount("/", ui)


add_not_found_handler(app)
