from slowapi import Limiter
from slowapi.util import get_remote_address

# Global Rate Limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
    storage_uri="memory://",
)
