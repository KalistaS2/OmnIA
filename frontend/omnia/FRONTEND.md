# OmnIA — Frontend

Aplicação **Angular 22** com **Server-Side Rendering (SSR)** que serve como interface principal do sistema de correição judiciária OmnIA.

---

## 🚀 Comandos Essenciais

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento (http://localhost:4200)
npm start

# Build de produção (gera dist/)
npm run build

# Executar o servidor SSR após o build
npm run serve:ssr:omnia

# Testes unitários
npm test

# Build em modo watch (development)
npm run watch
```

---

## 🗂️ Estrutura de Pastas

```
src/
├── app/
│   ├── components/     # Componentes reutilizáveis (UI, shell, badges)
│   ├── enviroment/     # Variáveis de ambiente (ex.: URL da API)
│   ├── guard/          # Guards de navegação (ex.: auth, mobile)
│   ├── mock-data/      # Dados mockados usados no protótipo
│   ├── pages/          # Componentes de página (uma pasta por rota)
│   ├── service/        # Services Angular (lógica de negócio e chamadas HTTP)
│   ├── app.routes.ts   # Definição de todas as rotas da aplicação
│   ├── app.config.ts   # Configuração do aplicativo (providers, roteamento)
│   └── app.ts          # Componente raiz
├── index.html          # HTML base com metadados e fontes
├── main.ts             # Bootstrap do cliente
├── main.server.ts      # Bootstrap do servidor (SSR)
├── server.ts           # Servidor Express para SSR
└── styles.scss         # Estilos globais e design tokens (CSS variables)
```

---

## 🗺️ Rotas Disponíveis

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `DashboardComponent` | Visão geral correicional |
| `/planejamento` | `PlanejamentoComponent` | Configuração do universo de auditoria |
| `/checklist` | `ChecklistComponent` | Regras de correição selecionáveis |
| `/aprovacao` | `AprovacaoComponent` | Lista de aprovações pendentes |
| `/aprovacao-processo` | `AprovacaoProcessoComponent` | Detalhe de aprovação por processo |
| `/criar-regra` | `CriarRegraComponent` | Criação de nova regra de correição |
| `/resultados` | `ResultadosComponent` | Resultados e riscos da análise |
| `/**` | `NotFoundComponent` | Página 404 |

---

## 🎨 Design System

O projeto usa **TailwindCSS 3** combinado com **CSS Variables** definidas em `src/styles.scss`. Isso permite temas e tokens centralizados.

### Paleta de cores principais

| Token | Uso |
|---|---|
| `--primary` | Cor de destaque principal |
| `--risk-high` / `--risk-high-soft` | Risco alto (vermelho) |
| `--risk-medium` / `--risk-medium-soft` | Risco médio (amarelo/laranja) |
| `--risk-low` / `--risk-low-soft` | Risco baixo (verde) |
| `--surface` / `--surface-strong` | Fundos de cards e painéis |

### Tipografia

- **Interface:** `IBM Plex Sans` (sans-serif)
- **Display/Títulos:** `Newsreader` (serif)

---

## 🧩 Componentes Reutilizáveis (`components/`)

| Componente | Descrição |
|---|---|
| `app-shell` | Layout base com sidebar de navegação e cabeçalho |
| `panel` | Container/painel com borda e fundo padronizados |
| `risk-badge` | Badge colorido de nível de risco (Alta / Média / Baixa) |
| `tag` | Tag genérica para categorias e situações |
| `ui/button` | Botão estilizado com variantes |
| `ui/badge` | Badge inline |
| `ui/card` | Card container |
| `ui/checkbox` | Checkbox acessível |
| `ui/input` | Campo de entrada de texto |
| `ui/select` | Select estilizado |

---

## 📦 Dependências Principais

| Pacote | Versão | Finalidade |
|---|---|---|
| `@angular/core` | ^22.1.0 | Framework principal |
| `@angular/ssr` | ^22.1.3 | Server-Side Rendering |
| `@angular/router` | ^22.1.0 | Roteamento |
| `tailwindcss` | ^3.4.19 | Utilitários CSS |
| `express` | ^5.1.0 | Servidor Node.js para SSR |
| `vitest` | ^4.0.8 | Testes unitários |
| `prettier` | ^3.8.1 | Formatação de código |

---

## 🔧 Configuração

- **`angular.json`** — Configurações de build, estilos globais e assets
- **`tailwind.config.js`** — Extensão da paleta e fontes do Tailwind
- **`tsconfig.json`** — Configuração base do TypeScript
- **`.prettierrc`** — Regras de formatação de código
- **`.editorconfig`** — Configurações de editor (indentação, charset)

---

## ⚠️ Atenção: Dados Mockados

A versão atual usa dados estáticos em `src/app/mock-data/prototype-data.ts` para simular a API. Ao integrar o backend real, os services em `src/app/service/` devem ser atualizados para realizar chamadas HTTP, removendo as importações diretas do `prototype-data.ts`.