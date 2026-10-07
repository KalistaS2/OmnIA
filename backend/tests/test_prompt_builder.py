"""
Testes para a montagem de prompt e carregamento de questionário.

Casos cobertos:
1. Carregamento de questionário existente.
2. Questionário inexistente retorna None.
3. Validação de IDs únicos no Pydantic.
"""

import pytest

from app.models.schemas import Pergunta, Questionario
from app.services.questionario_service import load_questionario


def test_load_existing_questionario():
    """Questionário de exemplo deve ser carregável."""
    q = load_questionario("questionario-exemplo-v1")
    assert q is not None
    assert q.id == "questionario-exemplo-v1"
    assert q.versao == "1.0"
    assert len(q.perguntas) > 0


def test_load_nonexistent_questionario():
    """Questionário inexistente retorna None."""
    q = load_questionario("questionario-que-nao-existe")
    assert q is None


def test_questionario_duplicate_ids_rejected():
    """Questionário com IDs duplicados deve falhar na validação Pydantic."""
    with pytest.raises(ValueError, match="duplicados"):
        Questionario(
            id="q-test",
            versao="1.0",
            titulo="Teste",
            perguntas=[
                Pergunta(id="p1", texto="Pergunta 1"),
                Pergunta(id="p1", texto="Pergunta duplicada"),
            ],
        )


def test_questionario_empty_question_text_rejected():
    """Pergunta com texto vazio deve falhar na validação Pydantic."""
    with pytest.raises(ValueError):
        Questionario(
            id="q-test",
            versao="1.0",
            titulo="Teste",
            perguntas=[
                Pergunta(id="p1", texto=""),
            ],
        )


def test_questionario_empty_perguntas_rejected():
    """Questionário sem perguntas deve falhar na validação Pydantic."""
    with pytest.raises(ValueError):
        Questionario(
            id="q-test",
            versao="1.0",
            titulo="Teste",
            perguntas=[],
        )
