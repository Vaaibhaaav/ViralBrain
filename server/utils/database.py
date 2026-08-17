import asyncpg
from server.config import NEON_DATABASE_URL

_pool: asyncpg.Pool | None = None

async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            NEON_DATABASE_URL,
            min_size=1,
            max_size=10,
            timeout=10,  # fail fast if the pool can't get a connection — same principle as before
            command_timeout=15,  # fail fast on a hanging query too
        )
    return _pool