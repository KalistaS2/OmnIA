"""
Dependências compartilhadas para injeção nos endpoints.
"""

from __future__ import annotations

from app.core.config import Settings, get_settings


def get_current_settings() -> Settings:
    """Dependência FastAPI para acessar configurações."""
    return get_settings()
