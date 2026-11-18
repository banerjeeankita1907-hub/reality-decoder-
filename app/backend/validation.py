"""Input validation helpers for the Reality Decoder API."""

from urllib.parse import urlparse

MAX_CONTENT_LENGTH = 4000
ALLOWED_CONTENT_TYPES = {"text", "url"}


def validate_content_request(content, content_type):
    """Return normalized content, its type, and a safe hostname (when applicable)."""
    if not isinstance(content, str):
        raise ValueError("content must be a string")

    normalized = content.strip()
    if not normalized:
        raise ValueError("content cannot be empty")
    if len(normalized) > MAX_CONTENT_LENGTH:
        raise ValueError(f"content must be {MAX_CONTENT_LENGTH} characters or fewer")
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError("content_type must be 'text' or 'url'")

    source_domain = None
    if content_type == "url":
        parsed = urlparse(normalized)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("URL content must be an absolute http or https URL")
        if parsed.username or parsed.password:
            raise ValueError("URLs containing embedded credentials are not accepted")
        source_domain = parsed.hostname.rstrip(".").lower()

    return normalized, content_type, source_domain


def normalize_limit(value, default=20, maximum=100):
    """Clamp a numeric pagination limit to a small positive range."""
    if isinstance(value, bool) or not isinstance(value, int):
        value = default
    return max(1, min(value, maximum))
