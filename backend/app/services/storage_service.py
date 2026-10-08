"""
Serviço de armazenamento de artefatos.

Suporta dois backends:
- "local": armazenamento em disco para desenvolvimento.
- "gcs": Google Cloud Storage para produção.

PDFs, JSONs brutos do OCR e respostas do LLM são armazenados aqui.
O banco de dados guarda apenas referências (paths/URIs) e hashes.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("storage")


class StorageService:
    """Gerencia armazenamento de artefatos com backend configurável."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.backend = self.settings.storage_backend

    def save_pdf(self, job_id: str, pdf_bytes: bytes, filename: str) -> str:
        """Salva PDF original e retorna a referência de armazenamento."""
        path = f"jobs/{job_id}/original/{filename}"
        self._save_bytes(path, pdf_bytes)
        logger.info("PDF salvo", extra={"job_id": job_id})
        return path

    def save_ocr_result(self, job_id: str, ocr_data: dict[str, Any]) -> str:
        """Salva resultado bruto do OCR em JSON."""
        path = f"jobs/{job_id}/ocr/document_ai_result.json"
        content = json.dumps(ocr_data, ensure_ascii=False, indent=2, default=str)
        self._save_bytes(path, content.encode("utf-8"))
        logger.info("OCR salvo", extra={"job_id": job_id})
        return path

    def save_llm_response(self, job_id: str, response_data: dict[str, Any]) -> str:
        """Salva resposta bruta do LLM."""
        path = f"jobs/{job_id}/llm/raw_response.json"
        content = json.dumps(response_data, ensure_ascii=False, indent=2, default=str)
        self._save_bytes(path, content.encode("utf-8"))
        logger.info("Resposta LLM salva", extra={"job_id": job_id})
        return path

    def save_validated_result(self, job_id: str, result_data: dict[str, Any]) -> str:
        """Salva resultado validado final."""
        path = f"jobs/{job_id}/result/validated_result.json"
        content = json.dumps(result_data, ensure_ascii=False, indent=2, default=str)
        self._save_bytes(path, content.encode("utf-8"))
        logger.info("Resultado validado salvo", extra={"job_id": job_id})
        return path

    def _save_bytes(self, path: str, data: bytes) -> None:
        """Salva bytes no backend configurado."""
        if self.backend == "gcs":
            self._save_to_gcs(path, data)
        else:
            self._save_to_local(path, data)

    def _save_to_local(self, path: str, data: bytes) -> None:
        """Salva no sistema de arquivos local."""
        base = Path(self.settings.local_storage_path)
        full_path = base / path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(data)

    def _save_to_gcs(self, path: str, data: bytes) -> None:
        """Salva no Google Cloud Storage."""
        from google.cloud import storage

        client = storage.Client(project=self.settings.google_cloud_project)
        bucket = client.bucket(self.settings.gcs_bucket_processos)
        blob = bucket.blob(path)
        blob.upload_from_string(data)


def get_storage_service() -> StorageService:
    """Factory para o serviço de armazenamento."""
    return StorageService()
