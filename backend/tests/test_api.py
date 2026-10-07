"""
Testes de integração para os endpoints da API.

Usa httpx.AsyncClient com serviços mockados (sem chamadas reais a APIs externas).
"""

import io
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """TestClient síncrono para testes de API."""
    return TestClient(app)


@pytest.fixture
def valid_pdf_bytes() -> bytes:
    """PDF mínimo válido para testes."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n"
        b"xref\n0 3\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"trailer\n<< /Size 3 /Root 1 0 R >>\n"
        b"startxref\n116\n%%EOF\n"
    )


class TestHealthEndpoint:
    def test_health_ok(self, client: TestClient):
        """Healthcheck deve retornar 200 e status ok."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "omnia-backend"


class TestAnalisarEndpoint:
    @patch("app.api.routes_processos.run_analysis")
    @patch("app.api.routes_processos.create_job")
    def test_submit_valid_pdf(
        self,
        mock_create_job: MagicMock,
        mock_run_analysis: MagicMock,
        client: TestClient,
        valid_pdf_bytes: bytes,
    ):
        """PDF válido com questionário existente deve retornar 202."""
        mock_create_job.return_value = {"_id": "test-job-id"}

        response = client.post(
            "/v1/processos/analisar",
            files={"file": ("test.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf")},
            data={"questionario_id": "questionario-exemplo-v1"},
        )

        assert response.status_code == 202
        data = response.json()
        assert "job_id" in data
        assert data["status"] == "recebido"

    def test_reject_nonexistent_questionario(
        self, client: TestClient, valid_pdf_bytes: bytes
    ):
        """Questionário inexistente deve retornar 400."""
        response = client.post(
            "/v1/processos/analisar",
            files={"file": ("test.pdf", io.BytesIO(valid_pdf_bytes), "application/pdf")},
            data={"questionario_id": "questionario-que-nao-existe"},
        )

        assert response.status_code == 400
        assert "não encontrado" in response.json()["detail"]

    def test_reject_non_pdf(self, client: TestClient):
        """Arquivo que não é PDF deve retornar 400."""
        fake_file = b"This is not a PDF at all"

        response = client.post(
            "/v1/processos/analisar",
            files={"file": ("fake.pdf", io.BytesIO(fake_file), "application/pdf")},
            data={"questionario_id": "questionario-exemplo-v1"},
        )

        assert response.status_code == 400
        assert "assinatura" in response.json()["detail"].lower() or "PDF" in response.json()["detail"]

    def test_reject_empty_file(self, client: TestClient):
        """Arquivo vazio deve retornar 400."""
        response = client.post(
            "/v1/processos/analisar",
            files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")},
            data={"questionario_id": "questionario-exemplo-v1"},
        )

        assert response.status_code == 400

    def test_reject_password_protected_pdf(self, client: TestClient):
        """PDF com /Encrypt deve retornar 400."""
        fake_encrypted = b"%PDF-1.4\n/Encrypt << >>\nrest of file"

        response = client.post(
            "/v1/processos/analisar",
            files={"file": ("encrypted.pdf", io.BytesIO(fake_encrypted), "application/pdf")},
            data={"questionario_id": "questionario-exemplo-v1"},
        )

        assert response.status_code == 400
        assert "senha" in response.json()["detail"].lower()


class TestStatusEndpoint:
    @patch("app.api.routes_processos.get_job")
    def test_get_existing_job(self, mock_get_job: MagicMock, client: TestClient):
        """Job existente deve retornar 200 com status."""
        mock_get_job.return_value = {
            "job_id": "test-123",
            "status": "recebido",
            "processo_id": None,
            "total_pages": None,
            "created_at": None,
            "started_at": None,
            "completed_at": None,
            "error_message": None,
        }

        response = client.get("/v1/processos/test-123")
        assert response.status_code == 200
        assert response.json()["job_id"] == "test-123"
        assert response.json()["status"] == "recebido"

    @patch("app.api.routes_processos.get_job")
    def test_get_nonexistent_job(self, mock_get_job: MagicMock, client: TestClient):
        """Job inexistente deve retornar 404."""
        mock_get_job.return_value = None

        response = client.get("/v1/processos/nonexistent-id")
        assert response.status_code == 404


class TestResultadoEndpoint:
    @patch("app.api.routes_processos.get_job")
    def test_get_completed_result(self, mock_get_job: MagicMock, client: TestClient):
        """Job concluído deve retornar resultado completo."""
        mock_get_job.return_value = {
            "job_id": "test-123",
            "status": "concluido",
            "total_pages": 10,
            "validated_response": {
                "questionario_id": "q1",
                "modelo": "gemini-test",
                "versao_prompt": "v1",
                "revisao_necessaria": False,
                "respostas": [
                    {
                        "pergunta_id": "p1",
                        "resposta": "Sim",
                        "paginas": [1],
                        "evidencia": "trecho do OCR",
                        "confianca": "alta",
                        "observacao": None,
                    }
                ],
            },
        }

        response = client.get("/v1/processos/test-123/resultado")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "concluido"
        assert len(data["respostas"]) == 1
        assert "aviso" in data

    @patch("app.api.routes_processos.get_job")
    def test_result_not_ready(self, mock_get_job: MagicMock, client: TestClient):
        """Job ainda em processamento deve retornar 409."""
        mock_get_job.return_value = {
            "job_id": "test-123",
            "status": "ocr_em_andamento",
        }

        response = client.get("/v1/processos/test-123/resultado")
        assert response.status_code == 409
