"""
Logging estruturado do Omnia Backend.

Logs nunca incluem conteúdo de documentos, textos OCR, evidências ou PII.
Apenas metadados operacionais: job_id, status, duração, contagens e erros categorizados.
"""

from __future__ import annotations

import logging
import json
import sys
from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings


class StructuredFormatter(logging.Formatter):
    """Formatter que produz JSON estruturado por linha."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Campos extras adicionados via `extra={"job_id": ...}`
        for key in ("job_id", "status", "duration_ms", "total_pages", "error_category"):
            value = getattr(record, key, None)
            if value is not None:
                log_entry[key] = value

        if record.exc_info and record.exc_info[1]:
            log_entry["exception_type"] = type(record.exc_info[1]).__name__
            log_entry["exception_message"] = str(record.exc_info[1])

        return json.dumps(log_entry, ensure_ascii=False, default=str)


def setup_logging() -> None:
    """Configura logging global da aplicação."""
    settings = get_settings()

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level.upper())

    # Limpar handlers existentes
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    root_logger.addHandler(handler)

    # Reduzir ruído de libs externas
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    logging.getLogger("google").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Retorna logger nomeado para um módulo."""
    return logging.getLogger(f"omnia.{name}")
