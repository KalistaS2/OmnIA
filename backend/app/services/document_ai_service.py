"""
Serviço de OCR com Google Document AI — Enterprise Document OCR.

Responsável por enviar o PDF ao processador Document AI e retornar
o resultado estruturado em OCRDocument com texto separado por página.
"""

from __future__ import annotations

import time

from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.schemas import OCRDocument, OCRPageResult

logger = get_logger("document_ai")


def process_document_ocr(pdf_bytes: bytes) -> OCRDocument:
    """
    Envia PDF ao Google Document AI e retorna OCRDocument estruturado.

    Args:
        pdf_bytes: Conteúdo binário do arquivo PDF.

    Returns:
        OCRDocument com texto integral, texto por página, metadados e warnings.
    """
    settings = get_settings()

    # Endpoint regional do Document AI
    opts = ClientOptions(
        api_endpoint=f"{settings.document_ai_location}-documentai.googleapis.com"
    )

    client = documentai.DocumentProcessorServiceClient(client_options=opts)

    # Nome completo do processador
    processor_name = client.processor_path(
        settings.google_cloud_project,
        settings.document_ai_location,
        settings.document_ai_processor_id,
    )

    # Documento raw
    raw_document = documentai.RawDocument(
        content=pdf_bytes,
        mime_type="application/pdf",
    )

    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document,
    )

    logger.info("Iniciando OCR via Document AI", extra={"status": "ocr_start"})
    start_time = time.time()

    result = client.process_document(
        request=request,
        timeout=settings.ocr_timeout_seconds,
    )

    duration_ms = int((time.time() - start_time) * 1000)
    logger.info(
        "OCR concluído",
        extra={"status": "ocr_done", "duration_ms": duration_ms},
    )

    document = result.document
    warnings: list[str] = []

    # Extrair texto por página
    pages: list[OCRPageResult] = []
    for i, page in enumerate(document.pages):
        page_number = i + 1
        page_text = _extract_page_text(document.text, page)
        has_text = bool(page_text.strip())

        if not has_text:
            warnings.append(f"Página {page_number} sem texto detectado")

        pages.append(
            OCRPageResult(
                page_number=page_number,
                text=page_text,
                has_text=has_text,
            )
        )

    return OCRDocument(
        full_text=document.text,
        pages=pages,
        total_pages=len(pages),
        processing_metadata={
            "duration_ms": duration_ms,
            "processor": settings.document_ai_processor_id,
            "mime_type": document.mime_type if document.mime_type else "application/pdf",
        },
        warnings=warnings,
    )


def _extract_page_text(full_text: str, page: documentai.Document.Page) -> str:
    """
    Extrai o texto de uma página específica usando os text_segments do layout.

    O Document AI armazena o texto completo em document.text e cada página
    contém referências (offsets) para os trechos relevantes.
    """
    text_parts: list[str] = []

    if page.layout and page.layout.text_anchor and page.layout.text_anchor.text_segments:
        for segment in page.layout.text_anchor.text_segments:
            start = int(segment.start_index) if segment.start_index else 0
            end = int(segment.end_index) if segment.end_index else 0
            text_parts.append(full_text[start:end])

    return "".join(text_parts)
