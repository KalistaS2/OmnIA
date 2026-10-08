"""
Serviço de validação defensiva das respostas do LLM.

Verifica alinhamento entre respostas, questionário e texto OCR.
Aplica conversões e marcações de revisão conforme regras da arquitetura.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.models.schemas import (
    AuditEntry,
    LLMAnalysis,
    Questionario,
    RespostaEnum,
    RespostaItem,
    ValidatedAnalysis,
)

logger = get_logger("validation")


class ValidationError(Exception):
    """Erro de validação irrecuperável."""


def _find_evidence_in_ocr(
    evidence: str,
    paginated_text: str,
    pages: list[int],
) -> bool:
    """
    Verifica se a evidência citada pelo LLM existe no texto OCR das páginas indicadas.

    Usa correspondência case-insensitive e normalização de espaços para
    tolerar pequenas diferenças de formatação do OCR.
    """
    if not evidence or not evidence.strip():
        return False

    # Normalizar para comparação
    evidence_normalized = " ".join(evidence.lower().split())

    # Extrair texto apenas das páginas citadas
    page_texts: list[str] = []
    for page_num in pages:
        # Procurar bloco da página no texto paginado
        marker_with_text = f"[PÁGINA {page_num}]"
        marker_no_text = f"[PÁGINA {page_num} — SEM TEXTO DETECTADO]"

        if marker_no_text in paginated_text:
            continue  # Página sem texto

        idx = paginated_text.find(marker_with_text)
        if idx == -1:
            continue

        # Extrair texto até o próximo marcador de página ou fim
        start = idx + len(marker_with_text)
        next_marker = paginated_text.find("\n\n[PÁGINA ", start)
        if next_marker == -1:
            page_text = paginated_text[start:]
        else:
            page_text = paginated_text[start:next_marker]

        page_texts.append(page_text)

    combined_text = " ".join(t.lower() for t in page_texts)
    combined_normalized = " ".join(combined_text.split())

    # Verificar correspondência — a evidência deve ser encontrável no texto
    return evidence_normalized in combined_normalized


def validate_llm_response(
    analysis: LLMAnalysis,
    questionnaire: Questionario,
    paginated_text: str,
    total_pages: int,
) -> ValidatedAnalysis:
    """
    Valida a resposta do LLM aplicando todas as regras de integridade.

    Regras aplicadas:
    1. Deve haver exatamente uma resposta para cada pergunta_id do questionário.
    2. Não pode haver IDs desconhecidos ou duplicados.
    3. Resposta só pode ser Sim, Não ou Não se aplica.
    4. Páginas devem estar entre 1 e total_paginas.
    5. Evidência é obrigatória e não vazia.
    6. Evidência deve ser localizada no texto OCR das páginas citadas.
    7. Se evidência inválida com Sim/Não → converter para Não se aplica.

    Args:
        analysis: Resposta parseada do LLM.
        questionnaire: Questionário original.
        paginated_text: Texto OCR com marcadores de página.
        total_pages: Número total de páginas do documento.

    Returns:
        ValidatedAnalysis com respostas corrigidas e log de auditoria.
    """
    audit_log: list[AuditEntry] = []
    revisao_necessaria = False

    # Mapear perguntas esperadas
    expected_ids = {p.id for p in questionnaire.perguntas}
    received_ids = [r.pergunta_id for r in analysis.respostas]
    received_ids_set = set(received_ids)

    # ── Verificar IDs duplicados ────────────────────────────────────
    if len(received_ids) != len(received_ids_set):
        duplicados = [pid for pid in received_ids if received_ids.count(pid) > 1]
        raise ValidationError(f"IDs de resposta duplicados: {set(duplicados)}")

    # ── Verificar IDs desconhecidos ─────────────────────────────────
    unknown_ids = received_ids_set - expected_ids
    if unknown_ids:
        raise ValidationError(f"IDs de resposta desconhecidos: {unknown_ids}")

    # ── Verificar IDs ausentes ──────────────────────────────────────
    missing_ids = expected_ids - received_ids_set
    if missing_ids:
        raise ValidationError(f"Perguntas sem resposta: {missing_ids}")

    # ── Validar cada resposta individualmente ───────────────────────
    validated_respostas: list[RespostaItem] = []

    for resp in analysis.respostas:
        modified = False

        # 1. Validar páginas dentro do intervalo
        invalid_pages = [p for p in resp.paginas if p < 1 or p > total_pages]
        if invalid_pages:
            audit_log.append(
                AuditEntry(
                    pergunta_id=resp.pergunta_id,
                    campo_alterado="paginas",
                    valor_original=str(resp.paginas),
                    valor_corrigido=str([p for p in resp.paginas if 1 <= p <= total_pages]),
                    motivo=f"Páginas fora do intervalo [1, {total_pages}]: {invalid_pages}",
                )
            )
            # Filtrar páginas válidas
            valid_pages = [p for p in resp.paginas if 1 <= p <= total_pages]
            if not valid_pages:
                # Sem páginas válidas → forçar não se aplica
                resp = resp.model_copy(
                    update={
                        "resposta": RespostaEnum.NAO_SE_APLICA,
                        "paginas": [1],  # Placeholder mínimo
                        "observacao": "Todas as páginas citadas estavam fora do intervalo válido.",
                    }
                )
                revisao_necessaria = True
                modified = True
            else:
                resp = resp.model_copy(update={"paginas": valid_pages})
                modified = True

        # 2. Validar evidência não vazia
        if not resp.evidencia or not resp.evidencia.strip():
            if resp.resposta in (RespostaEnum.SIM, RespostaEnum.NAO):
                audit_log.append(
                    AuditEntry(
                        pergunta_id=resp.pergunta_id,
                        campo_alterado="resposta",
                        valor_original=resp.resposta.value,
                        valor_corrigido=RespostaEnum.NAO_SE_APLICA.value,
                        motivo="Evidência vazia com resposta conclusiva",
                    )
                )
                resp = resp.model_copy(
                    update={
                        "resposta": RespostaEnum.NAO_SE_APLICA,
                        "observacao": "Resposta convertida: evidência vazia.",
                    }
                )
                revisao_necessaria = True
                modified = True

        # 3. Verificar evidência no texto OCR (se resposta conclusiva)
        if resp.resposta in (RespostaEnum.SIM, RespostaEnum.NAO) and not modified:
            evidence_found = _find_evidence_in_ocr(
                resp.evidencia, paginated_text, resp.paginas
            )
            if not evidence_found:
                audit_log.append(
                    AuditEntry(
                        pergunta_id=resp.pergunta_id,
                        campo_alterado="resposta",
                        valor_original=resp.resposta.value,
                        valor_corrigido=RespostaEnum.NAO_SE_APLICA.value,
                        motivo="Evidência não localizada no texto OCR das páginas citadas",
                    )
                )
                resp = resp.model_copy(
                    update={
                        "resposta": RespostaEnum.NAO_SE_APLICA,
                        "observacao": "Resposta convertida: evidência não encontrada nas páginas citadas.",
                    }
                )
                revisao_necessaria = True

        validated_respostas.append(resp)

    if audit_log:
        logger.warning(
            "Validação aplicou correções",
            extra={
                "job_id": analysis.processo_id,
                "total_corrections": len(audit_log),
            },
        )

    return ValidatedAnalysis(
        processo_id=analysis.processo_id,
        questionario_id=analysis.questionario_id,
        modelo=analysis.modelo,
        versao_prompt=analysis.versao_prompt,
        respostas=validated_respostas,
        revisao_necessaria=revisao_necessaria,
        audit_log=audit_log,
    )
