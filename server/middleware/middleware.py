import time
from collections import defaultdict

from fastapi import HTTPException, Request

_hits: dict[str, list[float]] = defaultdict(list)


def rate_limiter(max_calls: int, window_seconds: int, scope: str = "default"):
    """
    Returns a FastAPI dependency that limits `max_calls` per `window_seconds`,
    keyed by creator_id (falls back to client IP if not found).

    `scope` namespaces the key per-endpoint so limits on different routes
    don't share the same bucket.
    """

    async def _check(request: Request):
        key = await _extract_key(request, scope)
        now = time.time()

        window_start = now - window_seconds
        recent = [t for t in _hits[key] if t > window_start]

        if len(recent) >= max_calls:
            retry_after = int(recent[0] + window_seconds - now) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {retry_after}s.",
                headers={"Retry-After": str(retry_after)},
            )

        recent.append(now)
        _hits[key] = recent

    return _check


async def _extract_key(request: Request, scope: str) -> str:
    """
    Prefer creator_id from the JSON body (identifies the actual user).
    Falls back to client IP if the body can't be read/has no creator_id.
    """
    try:
        body = await request.json()
        creator_id = body.get("creator_id")
        if creator_id:
            return f"{scope}:creator:{creator_id}"
    except Exception:
        pass

    client_ip = request.client.host if request.client else "unknown"
    return f"{scope}:ip:{client_ip}"