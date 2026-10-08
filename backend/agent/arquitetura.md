# Serviço de análise de processos: Document AI + Gemini Flash

## Objetivo

Construir um serviço backend que receba um PDF de processo judicial, execute OCR com **Google Document AI – Enterprise Document OCR**, envie o texto estruturado para o **Gemini Flash** junto com um prompt de regras e uma lista de perguntas, e devolva respostas auditáveis em JSON.

O sistema deve responder a cada pergunta apenas com:

- `Sim`
- `Não`
- `Não se aplica`

Cada resposta deve obrigatoriamente conter a página e um trecho de evidência encontrado no OCR. O sistema não pode apresentar uma resposta conclusiva sem evidência verificável.

---

## Escopo desta entrega

Implementar um MVP funcional em Python, com API HTTP, capaz de processar **um PDF por requisição**.

### Fluxo obrigatório

```text
Cliente envia PDF + identificador do questionário
        ↓
API valida arquivo e cria job
        ↓
Google Document AI executa OCR
        ↓
Sistema transforma resultado em texto separado por página
        ↓
Sistema aplica prompt de regras + perguntas + texto OCR
        ↓
Gemini Flash gera resposta JSON estruturada
        ↓
Backend valida resposta, páginas e evidências
        ↓
API devolve resultado e persiste artefatos para auditoria
```

---

## Stack preferida

- Python 3.11+
- FastAPI
- Pydantic v2
- Google Cloud Document AI
- Gemini no Google AI Studio
- Google Cloud Storage para PDFs e artefatos, quando configurado
- MongoDB para metadados e resultados; mongoDB pode ser usado no modo local de desenvolvimento
- `google-cloud-documentai`
- `google-genai`
- `google-cloud-storage`
- `pytest`
- `ruff` e `mypy` (quando aplicável)

Não usar chave de API exposta em código. Em produção, usar credenciais da service account/ADC (Application Default Credentials).

---

## Modelos e configurações

Variáveis obrigatórias em `.env.example`:

```env
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLOUD_PROJECT=seu-projeto
GOOGLE_CLOUD_LOCATION=us
DOCUMENT_AI_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=xxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-3-flash-preview
GCS_BUCKET_PROCESSOS=nome-do-bucket
MAX_PDF_SIZE_MB=100
MAX_PAGES_PER_REQUEST=200
LOG_LEVEL=INFO
```

Observações:

- Não fixar o nome do modelo no código: ler `GEMINI_MODEL` da configuração.
- O modelo pode estar em preview e mudar de nome; a troca deve exigir somente alteração de variável de ambiente.
- Usar `temperature=0` ou a menor configuração determinística disponível para a chamada do modelo.
- Configurar retorno JSON estruturado (`application/json` ou schema equivalente suportado pelo SDK).

---

## Requisitos funcionais

### 1. Recebimento do processo

Criar endpoint:

```http
POST /v1/processos/analisar
Content-Type: multipart/form-data
```

Campos:

- `file`: PDF obrigatório.
- `questionario_id`: string obrigatória.
- `processo_id`: string opcional fornecida pelo cliente.

Validar:

- MIME type e assinatura real de PDF.
- Tamanho máximo configurável.
- Quantidade máxima de páginas configurável.
- Arquivo vazio, corrompido ou protegido por senha deve falhar com mensagem segura.

Retornar `202 Accepted` se o processamento for assíncrono, ou `200 OK` apenas se o modo síncrono estiver explicitamente habilitado.

### 2. OCR com Document AI

Usar o processador **Enterprise Document OCR**.

O resultado do OCR deve ser preservado integralmente em JSON e, no mínimo, conter:

- Texto integral.
- Texto por página.
- Número de páginas.
- Metadados de processamento.
- Referências de layout/âncoras quando disponíveis.
- Erros ou avisos do provider, se houver.

Criar função isolada:

```python
process_document_ocr(pdf_bytes: bytes) -> OCRDocument
```

Criar função para produzir texto utilizável pelo LLM sem perder página:

```python
build_paginated_text(ocr: OCRDocument) -> str
```

Formato obrigatório:

```text
[PÁGINA 1]
texto extraído da página 1

[PÁGINA 2]
texto extraído da página 2
```

Não concatenar páginas sem marcadores. Não descartar páginas vazias: indicar `[PÁGINA N — SEM TEXTO DETECTADO]`.

### 3. Questionários

As perguntas não devem ficar hardcoded no código do agente.

Criar pelo menos um questionário em arquivo versionado, por exemplo:

```text
app/questionarios/exemplo_v1.json
```

Formato:

```json
{
  "id": "questionario-exemplo-v1",
  "versao": "1.0",
  "titulo": "Regularidade do Processo",
  "perguntas": [
    {
      "id": "1",
      "texto": "As determinações do Magistrado foram cumpridas?"
    },
    {
      "id": "2",
      "texto": "Está sem paralisação no cartório há mais de 30 dias?"
    },
    {
      "id": "3",
      "texto": "Está sem conclusão há mais de 120 dias?"
    }
  ]
}
```

Validar IDs únicos e pergunta não vazia.

### 4. Prompt e regras de decisão

Armazenar o prompt-base em arquivo versionado, por exemplo:

```text
app/prompts/triagem_processual_v1.md
```

"Você é um Analista Jurídico de IA atuando na Corregedoria do Tribunal de Justiça de Roraima (TJRR). Sua função é ler textos extraídos de processos judiciais via OCR e verificar se o processo viola alguma das regras de auditoria estipuladas.

Data de Hoje: [INSERIR_DATA_ATUAL_DO_SISTEMA]

[REGRAS DE AUDITORIA ATIVAS]
[INSERIR_LISTA_DE_REGRAS_DO_BANCO_DE_DADOS]

[TEXTO DO PROCESSO VIA OCR]
[INSERIR_TEXTO_BRUTO_DO_OCR_AQUI]

Instruções de Análise:

Ignore cabeçalhos repetidos, quebras de linha anormais e erros de digitação óbvios causados pelo OCR.

Busque por datas de movimentação (formatos DD/MM/AAAA, D/M/AA, ou texto por extenso) e identifique qual é a movimentação mais recente.

Avalie o texto contra CADA UMA das regras de auditoria ativas listadas acima.

Formato de Saída Obrigatório (Strict JSON):
Retorne APENAS um objeto JSON válido, sem formatação markdown (```json), sem introdução ou conclusão. Siga esta estrutura:
{
"datas_identificadas": ["lista das 3 datas mais recentes encontradas no texto"],
"ultima_movimentacao_data": "DD/MM/AAAA",
"dias_inativo": numero_inteiro,
"regras_violadas": [
{
"id_da_regra": "Nome da Regra",
"se_aplica": true ou false,
"justificativa_baseada_no_texto": "Trecho exato do OCR ou cálculo que justifica a conclusão"
}
]
}"

### 5. Chamada ao Gemini Flash

Criar serviço isolado:

```python
analyze_with_gemini(
    paginated_ocr_text: str,
    questionnaire: Questionnaire,
    prompt_version: str,
) -> LLMAnalysis
```

A entrada deve conter, em ordem:

1. Prompt de sistema/regras.
2. Schema de saída esperado.
3. Perguntas do questionário.
4. Texto OCR paginado.

A resposta deve obedecer ao seguinte schema lógico:

```json
{
  "processo_id": "string ou null",
  "questionario_id": "string",
  "modelo": "string",
  "versao_prompt": "string",
  "respostas": [
    {
      "pergunta_id": "string",
      "resposta": "Sim | Não | Não se aplica",
      "paginas": [1],
      "evidencia": "trecho literal curto do OCR",
      "confianca": "alta | média | baixa",
      "observacao": "string ou null"
    }
  ]
}
```

Não aceitar Markdown na resposta do LLM. Não aceitar texto antes ou depois do JSON.

### 6. Validação de resposta

Implementar validação defensiva depois da resposta do LLM:

- Deve haver exatamente uma resposta para cada `pergunta_id` do questionário.
- Não pode haver IDs desconhecidos ou duplicados.
- `resposta` só pode ser `Sim`, `Não` ou `Não se aplica`.
- Toda resposta deve possuir uma ou mais páginas válidas entre `1` e `total_paginas`.
- `evidencia` é obrigatória e não pode ser vazia.
- A evidência deve ser procurada no texto OCR das páginas citadas.
- Se a evidência não for localizada com correspondência suficiente, marcar resultado como `revisao_necessaria=true`.
- Se houver `Sim` ou `Não` sem evidência válida, converter para `Não se aplica` e registrar o motivo na auditoria.
- JSON inválido deve ser tentado uma única vez com um prompt de reparo; se continuar inválido, falhar de maneira controlada e registrar o erro.

Nunca inventar páginas no backend. Nunca corrigir sem registrar a alteração.

---

## Persistência e auditoria

Para cada processamento, persistir:

- `job_id` UUID.
- `processo_id` fornecido pelo cliente, quando houver.
- Hash SHA-256 do PDF.
- Nome original do arquivo, sem confiar nele como identificador.
- Data/hora de criação, início e fim.
- Status: `recebido`, `ocr_em_andamento`, `ocr_concluido`, `analise_em_andamento`, `concluido`, `falhou`, `revisao_necessaria`.
- Número de páginas.
- JSON bruto do Document AI.
- Texto OCR por página.
- Questionário e versão usados.
- Prompt e versão usados.
- Modelo usado e configurações relevantes.
- Resposta bruta do LLM.
- Resposta validada/final.
- Erros técnicos, sem incluir conteúdo sensível em logs.

Armazenar os documentos originais e artefatos grandes no Cloud Storage. O banco deve guardar referências a objetos, hashes e metadados, não blobs grandes por padrão.

---

## Endpoints mínimos

```http
POST /v1/processos/analisar
GET  /v1/processos/{job_id}
GET  /v1/processos/{job_id}/resultado
GET  /health
```

### Resposta de criação de job

```json
{
  "job_id": "a3c5f1d6-6a99-4cdf-b64a-014a6e5602f9",
  "status": "recebido",
  "processo_id": "opcional-do-cliente"
}
```

### Resposta final esperada

```json
{
  "job_id": "a3c5f1d6-6a99-4cdf-b64a-014a6e5602f9",
  "status": "concluido",
  "total_paginas": 50,
  "questionario_id": "questionario-exemplo-v1",
  "modelo": "gemini-3-flash-preview",
  "versao_prompt": "1.0",
  "revisao_necessaria": false,
  "respostas": [
    {
      "pergunta_id": "pedido_danos_morais",
      "resposta": "Sim",
      "paginas": [8],
      "evidencia": "requer a condenação da ré ao pagamento de indenização por danos morais",
      "confianca": "alta",
      "observacao": null
    }
  ]
}
```

---

## Estratégia de processamento

### MVP

- Processamento síncrono ou tarefa em background simples.
- PDF de até 200 páginas.
- Um processo por job.
- Um questionário por execução.

### Preparação para produção

Desenhar interfaces para posterior uso de fila assíncrona, por exemplo Cloud Tasks, Pub/Sub, Celery ou RQ. Não bloquear uma requisição HTTP por vários minutos.

Processos maiores devem ser enviados ao Cloud Storage e tratados por fluxo batch/assíncrono. O projeto deve conseguir evoluir sem reescrever a lógica de OCR, análise, validação e persistência.

---

## Segurança e privacidade

Os PDFs podem conter dados pessoais e dados processuais sensíveis.

Requisitos obrigatórios:

- Não colocar PDF, OCR completo, prompts ou evidências em logs de aplicação.
- Não commitar `.env`, chaves JSON de service account ou PDFs de teste reais.
- Fornecer `.env.example` sem segredos.
- Usar IAM de menor privilégio.
- Usar URLs assinadas ou autenticação adequada para acesso a arquivos no bucket.
- Criptografia em trânsito e armazenamento gerenciado do Google Cloud.
- Separar ambientes `dev`, `staging` e `prod`.
- Implementar retenção configurável para arquivos e resultados.
- Adicionar aviso na API: o resultado é apoio à triagem e exige revisão humana conforme política do usuário.

---

## Observabilidade e custo

Adicionar logs estruturados sem conteúdo de documentos. Registrar no mínimo:

- `job_id`
- status
- duração do OCR
- duração da chamada LLM
- total de páginas
- quantidade estimada de caracteres/tokens de entrada
- quantidade de perguntas
- retries
- erro técnico categorizado

Criar limites configuráveis para evitar custo inesperado:

- máximo de páginas por arquivo
- máximo de tamanho do arquivo
- máximo de perguntas por questionário
- timeout de OCR e LLM
- máximo de uma tentativa de reparo de JSON

---

## Estrutura de projeto sugerida

```text
.
├── app/
│   ├── api/
│   │   ├── routes_processos.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── models/
│   │   ├── schemas.py
│   │   └── database.py
│   ├── services/
│   │   ├── document_ai_service.py
│   │   ├── ocr_text_service.py
│   │   ├── gemini_service.py
│   │   ├── validation_service.py
│   │   ├── storage_service.py
│   │   └── process_analysis_service.py
│   ├── prompts/
│   │   └── triagem_processual_v1.md
│   ├── questionarios/
│   │   └── exemplo_v1.json
│   └── main.py
├── tests/
│   ├── fixtures/
│   ├── test_ocr_text_service.py
│   ├── test_validation_service.py
│   ├── test_prompt_builder.py
│   └── test_api.py
├── .env.example
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Testes obrigatórios

Criar testes unitários sem chamadas reais às APIs para:

1. Conversão de OCR em texto com marcadores de página.
2. Montagem de prompt com questionário.
3. Validação de enum `Sim`, `Não`, `Não se aplica`.
4. Rejeição de página inexistente.
5. Rejeição/conversão de resposta `Sim` ou `Não` sem evidência.
6. Falha de JSON inválido do LLM.
7. IDs de pergunta ausentes, extras ou duplicados.
8. Tratamento de página sem texto OCR.

Criar integrações opcionais, desativadas por padrão, para Document AI e Vertex AI, usando variáveis de ambiente explícitas.

---

## Critérios de aceite

A entrega estará aceita quando:

- [ ] O projeto sobe localmente com instruções claras.
- [ ] `POST /v1/processos/analisar` aceita um PDF válido e um questionário existente.
- [ ] O Document AI é chamado por serviço isolado e retorna OCR por página.
- [ ] O Gemini é chamado por serviço isolado usando o modelo configurável.
- [ ] A resposta segue o schema definido.
- [ ] Todas as respostas possuem evidência e página(s).
- [ ] Respostas sem evidência válida são marcadas como `Não se aplica` e `revisao_necessaria=true`.
- [ ] Resultados e artefatos são persistidos para auditoria.
- [ ] Segredos não aparecem no repositório nem nos logs.
- [ ] Há testes unitários para regras críticas.
- [ ] Há documentação de execução local, variáveis de ambiente e deploy.

---

## Fora de escopo nesta primeira versão

- Decisão jurídica automática.
- Peticionamento ou protocolo em tribunais.
- Assinatura digital.
- Treinamento/fine-tuning de modelo.
- Interface web completa.
- Substituir revisão humana em decisões de alto impacto.
- Processamento de PDFs protegidos por senha sem fluxo explícito de autorização.

---

## Ordem recomendada de implementação

1. Criar a estrutura FastAPI, configuração e healthcheck.
2. Criar schemas Pydantic e questionário de exemplo.
3. Implementar serviço mockado de OCR e texto paginado.
4. Implementar validação de resposta do LLM e testes unitários.
5. Implementar integração real com Document AI.
6. Implementar integração real com Gemini.
7. Implementar persistência de jobs e artefatos.
8. Implementar endpoint e processamento assíncrono.
9. Implementar observabilidade, Docker e documentação de deploy.

Prioridade absoluta: rastreabilidade da evidência, validação defensiva e segurança de dados.
