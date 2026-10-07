"""
Serviço de formatação de texto OCR paginado.

Transforma o resultado do Document AI em texto com marcadores de página,
pronto para inclusão no prompt do LLM.
"""

from __future__ import annotations

from app.models.schemas import OCRDocument


def build_paginated_text(ocr: OCRDocument) -> str:
    """
    Converte OCRDocument em texto com marcadores de página.

    Formato de saída:
        [PÁGINA 1]
        texto extraído da página 1

        [PÁGINA 2]
        texto extraído da página 2

    Páginas sem texto recebem o marcador:
        [PÁGINA N — SEM TEXTO DETECTADO]

    Args:
        ocr: Resultado do OCR estruturado por página.

    Returns:
        String com todo o texto separado por marcadores de página.
    """
    sections: list[str] = []

    for page in ocr.pages:
        if page.has_text and page.text.strip():
            header = f"[PÁGINA {page.page_number}]"
            sections.append(f"{header}\n{page.text.strip()}")
        else:
            sections.append(f"[PÁGINA {page.page_number} — SEM TEXTO DETECTADO]")

    return "\n\n".join(sections)
