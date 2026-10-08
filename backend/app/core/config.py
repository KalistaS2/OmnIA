"""
Configuração centralizada do Omnia Backend.

Todas as variáveis de ambiente são carregadas aqui via pydantic-settings.
Nenhum segredo deve ser hardcoded — tudo vem de .env ou variáveis de ambiente do sistema.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Raiz do projeto (dois níveis acima deste arquivo)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Configurações globais da aplicação."""

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Gemini ───────────────────────────────────
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"

    # ── Google Cloud ─────────────────────────────
    google_cloud_project: str = ""
    google_cloud_location: str = "us"
    google_application_credentials: str = ""

    # ── Document AI ──────────────────────────────
    document_ai_location: str = "us"
    document_ai_processor_id: str = ""
    document_ai_online_page_limit: int = 15

    # ── Google Cloud Storage ─────────────────────
    gcs_bucket_processos: str = ""
    storage_backend: str = "local"  # "local" ou "gcs"
    local_storage_path: str = str(PROJECT_ROOT / "storage")

    # ── MongoDB ──────────────────────────────────
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database: str = "omnia"

    # ── Limites ──────────────────────────────────
    max_pdf_size_mb: int = 100
    max_pages_per_request: int = 200
    max_questions_per_questionnaire: int = 50

    # ── Timeouts (segundos) ──────────────────────
    ocr_timeout_seconds: int = 300
    llm_timeout_seconds: int = 120

    # ── Observabilidade ──────────────────────────
    log_level: str = "INFO"

    @property
    def max_pdf_size_bytes(self) -> int:
        return self.max_pdf_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Retorna instância cacheada das configurações."""
    import os
    settings = Settings()
    if settings.google_application_credentials and not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
    return settings
