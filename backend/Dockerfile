FROM python:3.11-slim AS base

# Evitar cache de bytecode e buffering de output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ── Instalar dependências do sistema ──────────────────────
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# ── Instalar dependências Python ──────────────────────────
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir .

# ── Copiar código da aplicação ────────────────────────────
COPY app/ ./app/

# ── Usuário não-root ──────────────────────────────────────
RUN useradd --create-home appuser
USER appuser

# ── Expor porta e iniciar ─────────────────────────────────
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
