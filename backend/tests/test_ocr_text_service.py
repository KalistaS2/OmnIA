"""
Testes unitários para o serviço de texto OCR paginado.

Casos cobertos:
1. Conversão de páginas com texto em formato [PÁGINA N].
2. Páginas sem texto recebem marcador [PÁGINA N — SEM TEXTO DETECTADO].
3. Documento com múltiplas páginas mistas.
4. Documento vazio (sem páginas).
"""

from app.models.schemas import OCRDocument, OCRPageResult
from app.services.ocr_text_service import build_paginated_text


def test_single_page_with_text():
    """Página com texto deve receber marcador [PÁGINA N]."""
    ocr = OCRDocument(
        full_text="Texto da página 1",
        pages=[
            OCRPageResult(page_number=1, text="Texto da página 1", has_text=True),
        ],
        total_pages=1,
    )

    result = build_paginated_text(ocr)

    assert "[PÁGINA 1]" in result
    assert "Texto da página 1" in result
    assert "SEM TEXTO DETECTADO" not in result


def test_page_without_text():
    """Página sem texto deve receber marcador especial."""
    ocr = OCRDocument(
        full_text="",
        pages=[
            OCRPageResult(page_number=1, text="", has_text=False),
        ],
        total_pages=1,
    )

    result = build_paginated_text(ocr)

    assert "[PÁGINA 1 — SEM TEXTO DETECTADO]" in result


def test_multiple_pages_mixed():
    """Documento com páginas com e sem texto."""
    ocr = OCRDocument(
        full_text="Texto página 1\nTexto página 3",
        pages=[
            OCRPageResult(page_number=1, text="Texto página 1", has_text=True),
            OCRPageResult(page_number=2, text="", has_text=False),
            OCRPageResult(page_number=3, text="Texto página 3", has_text=True),
        ],
        total_pages=3,
    )

    result = build_paginated_text(ocr)

    assert "[PÁGINA 1]" in result
    assert "Texto página 1" in result
    assert "[PÁGINA 2 — SEM TEXTO DETECTADO]" in result
    assert "[PÁGINA 3]" in result
    assert "Texto página 3" in result


def test_empty_document():
    """Documento sem páginas retorna string vazia."""
    ocr = OCRDocument(full_text="", pages=[], total_pages=0)

    result = build_paginated_text(ocr)

    assert result == ""


def test_page_with_whitespace_only():
    """Página com apenas espaços em branco é tratada como sem texto."""
    ocr = OCRDocument(
        full_text="   \n\n  ",
        pages=[
            OCRPageResult(page_number=1, text="   \n\n  ", has_text=True),
        ],
        total_pages=1,
    )

    result = build_paginated_text(ocr)

    # has_text=True mas strip() é vazio → marcador sem texto
    assert "[PÁGINA 1 — SEM TEXTO DETECTADO]" in result


def test_page_numbering_preserved():
    """Numeração de páginas é preservada mesmo com gaps."""
    ocr = OCRDocument(
        full_text="",
        pages=[
            OCRPageResult(page_number=5, text="Texto cinco", has_text=True),
            OCRPageResult(page_number=10, text="Texto dez", has_text=True),
        ],
        total_pages=2,
    )

    result = build_paginated_text(ocr)

    assert "[PÁGINA 5]" in result
    assert "[PÁGINA 10]" in result
    assert "Texto cinco" in result
    assert "Texto dez" in result
