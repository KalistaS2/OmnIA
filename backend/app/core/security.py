"""
Utilitários de segurança do Omnia Backend.

Inclui validação de PDF, hashing seguro e sanitização de nomes de arquivo.
"""

from __future__ import annotations

import hashlib
import re

# Assinatura mágica de PDF — primeiros 5 bytes
PDF_MAGIC_BYTES = b"%PDF-"


def is_valid_pdf_signature(data: bytes) -> bool:
    """Verifica se os bytes iniciais correspondem a um PDF válido."""
    return data[:5] == PDF_MAGIC_BYTES


def compute_sha256(data: bytes) -> str:
    """Calcula hash SHA-256 dos dados fornecidos."""
    return hashlib.sha256(data).hexdigest()


def sanitize_filename(filename: str) -> str:
    """Remove caracteres perigosos do nome de arquivo, preservando extensão."""
    # Remove path separators e caracteres especiais
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", filename)
    # Limita tamanho
    if len(name) > 200:
        name = name[:200]
    return name


def is_password_protected_pdf(data: bytes) -> bool:
    """
    Heurística simples para detectar PDF protegido por senha.
    Verifica a presença de /Encrypt no dicionário do PDF.
    """
    # Procura nos primeiros 4KB para performance
    header = data[:4096]
    return b"/Encrypt" in header
