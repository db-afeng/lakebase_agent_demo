"""Resolve Lakebase DB credentials: from env (local) or via Databricks OAuth (deployed app)."""

import os
import threading
import time

from .._metadata import app_slug

# Token cache for OAuth: (password, expiry_ts). Refreshed before expiry (e.g. 45 min TTL).
_oauth_token_cache: tuple[str, float] | None = None
_oauth_token_lock = threading.Lock()
_OAUTH_TOKEN_TTL_SECONDS = 45 * 60  # 45 minutes; tokens expire in 1 hour


def _is_oauth_mode() -> bool:
    """True when DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET are set."""
    return bool(
        os.environ.get("DATABRICKS_CLIENT_ID")
        and os.environ.get("DATABRICKS_CLIENT_SECRET")
    )


def resolve_lakebase_credentials() -> tuple[str, str]:
    """
    Return (db_user, db_password) for Lakebase PostgreSQL.

    - OAuth mode (DATABRICKS_CLIENT_ID + DATABRICKS_CLIENT_SECRET set):
      Uses WorkspaceClient and postgres.generate_database_credential(endpoint).
      Username = DATABRICKS_CLIENT_ID; password = token.
      Requires LAKEBASE_AGENT_DEMO_DB_OAUTH_ENDPOINT and DATABRICKS_HOST.
    - Otherwise: reads LAKEBASE_AGENT_DEMO_DB_USER and LAKEBASE_AGENT_DEMO_DB_PASSWORD from env.
    """
    if _is_oauth_mode():
        return _resolve_oauth_credentials()
    return _resolve_env_credentials()


def _resolve_env_credentials() -> tuple[str, str]:
    """Use DB user/password from environment (e.g. .env for local dev)."""
    prefix = f"{app_slug.upper()}_"
    user = os.environ.get(f"{prefix}DB_USER", "")
    password = os.environ.get(f"{prefix}DB_PASSWORD", "")
    return (user, password)


def _resolve_oauth_credentials() -> tuple[str, str]:
    """Mint OAuth token via Databricks SDK; return (client_id, token) as (user, password)."""
    from databricks.sdk import WorkspaceClient

    client_id = os.environ.get("DATABRICKS_CLIENT_ID", "")
    client_secret = os.environ.get("DATABRICKS_CLIENT_SECRET", "")
    host = os.environ.get("DATABRICKS_HOST", "")
    prefix = f"{app_slug.upper()}_"
    endpoint = os.environ.get(f"{prefix}DB_OAUTH_ENDPOINT", "").strip()

    if not host:
        raise ValueError(
            "OAuth mode is enabled (DATABRICKS_CLIENT_ID/SECRET set) but DATABRICKS_HOST is not set. "
            "Set DATABRICKS_HOST to your workspace URL (e.g. https://e2-demo-field-eng.cloud.databricks.com)."
        )
    if not endpoint:
        raise ValueError(
            "OAuth mode is enabled but LAKEBASE_AGENT_DEMO_DB_OAUTH_ENDPOINT is not set. "
            "Set it to the full Lakebase endpoint path, e.g. "
            "projects/{project_id}/branches/{branch_id}/endpoints/{endpoint_id}."
        )

    if not host.startswith("http"):
        host = f"https://{host}"

    w = WorkspaceClient(host=host, client_id=client_id, client_secret=client_secret)
    credential = w.postgres.generate_database_credential(endpoint=endpoint)
    token = credential.token or ""
    return (client_id, token)


def get_password_for_connection() -> str:
    """
    Return the current DB password for use when opening a new connection.

    In OAuth mode, returns a cached token and refreshes it if expired (or missing).
    Call this from pool/dialect hooks (e.g. do_connect) so each new connection
    uses a valid token. Not for use in non-OAuth mode (caller should check _is_oauth_mode first).
    """
    global _oauth_token_cache
    if not _is_oauth_mode():
        return ""
    with _oauth_token_lock:
        now = time.time()
        if _oauth_token_cache is not None and now < _oauth_token_cache[1]:
            return _oauth_token_cache[0]
        _, password = _resolve_oauth_credentials()
        expiry = now + _OAUTH_TOKEN_TTL_SECONDS
        _oauth_token_cache = (password, expiry)
        return password
