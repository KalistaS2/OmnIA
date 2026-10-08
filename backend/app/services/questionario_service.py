"""
Serviço de carregamento de questionários.

Lê questionários versionados de arquivos JSON no diretório app/questionarios/.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.core.logging import get_logger
from app.models.schemas import Questionario

logger = get_logger("questionario")

QUESTIONARIOS_DIR = Path(__file__).resolve().parent.parent / "questionarios"

# Cache em memória
_cache: dict[str, Questionario] = {}


def load_questionario(questionario_id: str) -> Questionario | None:
    """
    Carrega questionário pelo ID.

    Procura em todos os arquivos .json do diretório de questionários
    até encontrar o ID correspondente.

    Args:
        questionario_id: ID do questionário.

    Returns:
        Questionario ou None se não encontrado.
    """
    if questionario_id in _cache:
        return _cache[questionario_id]

    for json_file in QUESTIONARIOS_DIR.glob("*.json"):
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
            q = Questionario(**data)
            _cache[q.id] = q
            if q.id == questionario_id:
                return q
        except Exception as e:
            logger.warning(
                f"Erro ao carregar questionário {json_file.name}: {e}",
                extra={"error_category": "questionario_load"},
            )
            continue

    return None


def list_questionarios() -> list[Questionario]:
    """Retorna todos os questionários disponíveis."""
    result: list[Questionario] = []
    for json_file in QUESTIONARIOS_DIR.glob("*.json"):
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
            q = Questionario(**data)
            _cache[q.id] = q
            result.append(q)
        except Exception:
            continue
    return result
