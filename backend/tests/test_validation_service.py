"""
Testes unitários para o serviço de validação defensiva.

Casos cobertos:
1. Validação de enum Sim/Não/Não se aplica.
2. Rejeição de página inexistente.
3. Rejeição/conversão de resposta Sim/Não sem evidência.
4. IDs de pergunta ausentes, extras ou duplicados.
5. Evidência não encontrada no texto OCR.
6. Resposta válida completa sem correções.
"""

import pytest

from app.models.schemas import (
    ConfiancaEnum,
    LLMAnalysis,
    Pergunta,
    Questionario,
    RespostaEnum,
    RespostaItem,
)
from app.services.validation_service import ValidationError, validate_llm_response


# ─── Fixtures ────────────────────────────────────────────────────────


def _make_questionnaire() -> Questionario:
    return Questionario(
        id="test-q1",
        versao="1.0",
        titulo="Teste",
        perguntas=[
            Pergunta(id="p1", texto="Pergunta 1?"),
            Pergunta(id="p2", texto="Pergunta 2?"),
        ],
    )


def _make_paginated_text() -> str:
    return (
        "[PÁGINA 1]\n"
        "O réu foi citado conforme determina a legislação vigente.\n"
        "\n"
        "[PÁGINA 2]\n"
        "O Ministério Público emitiu parecer favorável ao pedido."
    )


def _make_analysis(respostas: list[RespostaItem]) -> LLMAnalysis:
    return LLMAnalysis(
        processo_id="proc-123",
        questionario_id="test-q1",
        modelo="gemini-test",
        versao_prompt="v1",
        respostas=respostas,
    )


# ─── Testes ──────────────────────────────────────────────────────────


def test_valid_response_no_corrections():
    """Resposta válida passa sem correções."""
    respostas = [
        RespostaItem(
            pergunta_id="p1",
            resposta=RespostaEnum.SIM,
            paginas=[1],
            evidencia="réu foi citado conforme determina a legislação vigente",
            confianca=ConfiancaEnum.ALTA,
        ),
        RespostaItem(
            pergunta_id="p2",
            resposta=RespostaEnum.SIM,
            paginas=[2],
            evidencia="ministério público emitiu parecer favorável ao pedido",
            confianca=ConfiancaEnum.ALTA,
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    assert not result.revisao_necessaria
    assert len(result.audit_log) == 0
    assert len(result.respostas) == 2


def test_duplicate_ids_raises():
    """IDs duplicados devem lançar ValidationError."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1], evidencia="réu foi citado",
        ),
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.NAO,
            paginas=[2], evidencia="parecer favorável",
        ),
    ]
    analysis = _make_analysis(respostas)

    with pytest.raises(ValidationError, match="duplicados"):
        validate_llm_response(
            analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
        )


def test_unknown_ids_raises():
    """IDs desconhecidos devem lançar ValidationError."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1], evidencia="réu foi citado",
        ),
        RespostaItem(
            pergunta_id="p_inexistente", resposta=RespostaEnum.NAO,
            paginas=[2], evidencia="parecer",
        ),
    ]
    analysis = _make_analysis(respostas)

    with pytest.raises(ValidationError, match="desconhecidos"):
        validate_llm_response(
            analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
        )


def test_missing_ids_raises():
    """Perguntas sem resposta devem lançar ValidationError."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1], evidencia="réu foi citado",
        ),
        # p2 está faltando
    ]
    analysis = _make_analysis(respostas)

    with pytest.raises(ValidationError, match="sem resposta"):
        validate_llm_response(
            analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
        )


def test_invalid_page_number():
    """Páginas fora do intervalo devem ser filtradas e logar auditoria."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1, 99],  # 99 é inválido
            evidencia="réu foi citado conforme determina a legislação vigente",
        ),
        RespostaItem(
            pergunta_id="p2", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[2], evidencia="sem evidência relevante",
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    # Página 99 removida, resta página 1
    p1_resp = next(r for r in result.respostas if r.pergunta_id == "p1")
    assert 99 not in p1_resp.paginas
    assert 1 in p1_resp.paginas
    assert len(result.audit_log) > 0


def test_all_pages_invalid_forces_nao_se_aplica():
    """Se TODAS as páginas forem inválidas → forçar Não se aplica."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[99, 100],  # todas inválidas
            evidencia="texto inventado",
        ),
        RespostaItem(
            pergunta_id="p2", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[1], evidencia="algo",
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    p1_resp = next(r for r in result.respostas if r.pergunta_id == "p1")
    assert p1_resp.resposta == RespostaEnum.NAO_SE_APLICA
    assert result.revisao_necessaria


def test_empty_evidence_converts_to_nao_se_aplica():
    """Resposta Sim/Não sem evidência deve ser convertida."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1], evidencia="",  # Vazia!
        ),
        RespostaItem(
            pergunta_id="p2", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[2], evidencia="sem dados",
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    p1_resp = next(r for r in result.respostas if r.pergunta_id == "p1")
    assert p1_resp.resposta == RespostaEnum.NAO_SE_APLICA
    assert result.revisao_necessaria
    assert any(e.pergunta_id == "p1" and e.campo_alterado == "resposta" for e in result.audit_log)


def test_evidence_not_found_in_ocr_converts():
    """Evidência não localizada no OCR → converter para Não se aplica."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.SIM,
            paginas=[1],
            evidencia="texto completamente inventado que não existe no OCR",
        ),
        RespostaItem(
            pergunta_id="p2", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[2], evidencia="qualquer coisa",
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    p1_resp = next(r for r in result.respostas if r.pergunta_id == "p1")
    assert p1_resp.resposta == RespostaEnum.NAO_SE_APLICA
    assert result.revisao_necessaria


def test_nao_se_aplica_not_checked_for_evidence():
    """Resposta 'Não se aplica' não precisa de validação de evidência no OCR."""
    respostas = [
        RespostaItem(
            pergunta_id="p1", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[1],
            evidencia="texto inventado mas OK porque é Não se aplica",
        ),
        RespostaItem(
            pergunta_id="p2", resposta=RespostaEnum.NAO_SE_APLICA,
            paginas=[2], evidencia="outro texto",
        ),
    ]
    analysis = _make_analysis(respostas)
    result = validate_llm_response(
        analysis, _make_questionnaire(), _make_paginated_text(), total_pages=2
    )

    assert not result.revisao_necessaria
    assert len(result.audit_log) == 0
