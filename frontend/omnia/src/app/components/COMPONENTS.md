# components/

Diretório de **componentes reutilizáveis** da aplicação OmnIA. Cada subpasta contém um componente Angular autônomo (`standalone: true`) que pode ser importado em qualquer página ou outro componente.

---

## 📁 Estrutura

```
components/
├── app-shell/      # Layout base da aplicação (sidebar + cabeçalho)
├── panel/          # Container de painel/seção
├── risk-badge/     # Badge de nível de risco (Alta / Média / Baixa)
├── tag/            # Tag genérica de categorias/situações
└── ui/             # Componentes primitivos de interface
    ├── badge/
    ├── button/
    ├── card/
    ├── checkbox/
    ├── input/
    └── select/
```

---

## 🧩 Descrição dos Componentes

### `app-shell`
Layout principal que envolve todas as páginas. Inclui:
- **Sidebar** com navegação pelas 5 etapas do fluxo correicional
- **Cabeçalho** com título da página, período de referência, busca e notificações

**Uso:**
```html
<app-shell title="Dashboard Correicional" subtitle="Período de referência">
  <!-- conteúdo da página aqui -->
</app-shell>
```

**Inputs:**
| Input | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | `string` | ✅ | Título exibido no cabeçalho |
| `subtitle` | `string` | ❌ | Subtítulo opcional do cabeçalho |

---

### `panel`
Container com borda, fundo e padding padronizados para seções de conteúdo.

---

### `risk-badge`
Exibe o nível de atenção/risco de um processo com cor semântica.

| Valor | Cor |
|---|---|
| `Alta` | Vermelho (`--risk-high`) |
| `Média` | Amarelo/laranja (`--risk-medium`) |
| `Baixa` | Verde (`--risk-low`) |

---

### `tag`
Tag inline para exibir categorias, classes processuais, situações, etc.

---

### `ui/` — Componentes Primitivos
Biblioteca de componentes base para formulários e layout:

| Componente | Uso |
|---|---|
| `button` | Botões com variantes (primary, secondary, outline, ghost) |
| `badge` | Badge compacto inline |
| `card` | Container com sombra e borda arredondada |
| `checkbox` | Checkbox acessível com label |
| `input` | Campo de texto com estilo padronizado |
| `select` | Dropdown selecionável estilizado |

---

## 📝 Convenções

- Todos os componentes são **`standalone: true`** — importe-os diretamente no array `imports` do componente consumidor.
- Novos componentes reutilizáveis devem ser criados aqui. Componentes específicos de uma única página ficam dentro da pasta `pages/`.
- Use o Angular CLI para gerar: `ng generate component components/nome-do-componente --standalone`