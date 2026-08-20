# OmnIA

Sistema de **corреição judiciária inteligente** desenvolvido para apoiar corregedorias e tribunais na auditoria automatizada de processos judiciais com base em regras configuráveis.

---

## 🏛️ Contexto do Projeto

O **OmnIA** foi criado para modernizar o fluxo de correição de varas judiciais. Ele automatiza a verificação de conformidade dos processos usando regras parametrizáveis (ex.: paralisa­ção acima do prazo, ausência de cumprimento de ordem judicial, inconsistência de classificação) e apresenta os resultados em uma interface visual para equipes de correição.

---

## 📁 Estrutura do Repositório

```
OmnIA/
└── frontend/
    └── omnia/          # Aplicação Angular (SSR) — interface principal do sistema
```

> **Nota:** O backend (API) ainda não está neste repositório. A versão atual utiliza dados mockados (`mock-data/prototype-data.ts`) que simulam respostas da futura API.

---

## 🚀 Como Executar

### Pré-requisitos

| Ferramenta | Versão recomendada |
|---|---|
| Node.js | 20.x ou superior |
| npm | 11.x ou superior |
| Angular CLI | 22.x |

### Instalação e execução

```bash
# 1. Acesse o diretório do frontend
cd frontend/omnia

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm start
# ou: npx ng serve
```
A aplicação ficará disponível em **http://localhost:4200**

---

## 🗺️ Fluxo Principal da Aplicação

O sistema segue um fluxo linear de 5 etapas acessíveis pelo menu lateral:

```
[01] Dashboard Correicional
     └── Visão geral de ocorrências, riscos e histórico de correições

[02] Planejamento
     └── Definição do universo de auditoria (classes, assuntos, período)

[03] Regras de Correição
     └── Seleção e configuração das regras a serem verificadas

[04] Aprovação e Execução
     └── Revisão e autorização antes de disparar a análise

[05] Resultados e Riscos
     └── Visualização dos processos sinalizados e seus veredictos
```

---

## 🧩 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Angular 22 (com SSR via `@angular/ssr`) |
| Linguagem | TypeScript 6 |
| Estilização | TailwindCSS 3 + CSS Variables (design tokens) |
| Ícones | Google Material Symbols Outlined |
| Fonte | IBM Plex Sans (interface) · Newsreader (display) |
| Testes unitários | Vitest |
| Formatador | Prettier |

---

## 👥 Para a Equipe

- O arquivo de dados mockados está em `frontend/omnia/src/app/mock-data/prototype-data.ts`. Toda lógica de integração com a API futura deve substituir as importações desse arquivo nos services.
- O design system usa **CSS Variables** definidas em `src/styles.scss`. Toda nova cor ou token deve ser adicionada lá.
- Consulte a documentação dentro de cada pasta para orientações específicas de cada camada:
  - `frontend/omnia/` → `FRONTEND.md`
  - `src/app/components/` → `COMPONENTS.md`
  - `src/app/service/` → `SERVICES.md`
  - `src/app/guard/` → `GUARDS.md`
  - `src/app/mock-data/` → `MOCK_DATA.md`
  - `src/app/enviroment/` → `ENVIRONMENT.md`

---

## 📌 Status do Projeto

> ⚠️ **Protótipo funcional** — dados são mockados.
