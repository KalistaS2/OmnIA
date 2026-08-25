# mock-data/

Diretório de **dados mockados** utilizados no protótipo do OmnIA enquanto a API real não está disponível.

---

## 📄 Arquivo Principal

### `prototype-data.ts`

Contém todos os dados estáticos que simulam as respostas da futura API. Organizado pelos seguintes domínios:

| Export | Tipo | Descrição |
|---|---|---|
| `REFERENCE_PERIOD` | `string` | Período de referência da correição atual |
| `totaisCorreicao` | `object[]` | Totais de ocorrências por categoria |
| `regrasMaisFrequentes` | `object[]` | Ranking de regras com mais sinalizações |
| `distribuicaoSituacao` | `object[]` | Distribuição de processos por situação |
| `processos` | `Processo[]` | Lista de processos com ocorrências e riscos |
| `universoAuditoria` | `[string, string][]` | Parâmetros do universo auditado |
| `relatorioUltimaCorreicao` | `object` | Resumo da última correição realizada |
| `correicaoPorProcesso` | `Record<string, ItemVeredito[]>` | Veredictos por processo |
| `detalhesRegra` | `Record<string, DetalheRegraInfo>` | Detalhes de cada regra de correição |

---

## 🧩 Interfaces e Tipos

```typescript
// Nível de atenção de um processo
type Atencao = 'Alta' | 'Média' | 'Baixa';

// Situação de um processo
type SituacaoProcesso = 'Ativo' | 'Suspenso' | 'Arquivado';

// Veredicto de uma regra aplicada a um processo
type Veredito = 'Atende' | 'Não atende' | 'Não se encaixa';

// Estrutura de um processo
interface Processo {
  numero: string;
  unidade: string;
  classe: string;
  assunto: string;
  situacao: SituacaoProcesso;
  ultimoMovimento: string;
  ocorrencias: number;
  criticos: number;
  atencao: Atencao;
  destaque?: boolean;
}

// Resultado de uma regra para um processo específico
interface ItemVeredito {
  regra: string;
  veredito: Veredito;
  trecho: string;
}

// Detalhes de lógica de avaliação de uma regra
interface DetalheRegraInfo {
  passos: string[];
  atende: string[];
  naoAtende: string[];
  naoEncaixa: string[];
}
```

---

## ⚠️ Como Substituir pelos Dados Reais

Ao integrar a API, **não altere** este arquivo. Em vez disso:

1. Crie os services correspondentes em `../service/`
2. Nos componentes, substitua as importações diretas do `prototype-data.ts` por injeção do service
3. Mantenha este arquivo como referência do contrato de dados esperado pela UI

**Antes (mock):**
```typescript
import { processos } from '../mock-data/prototype-data';
```

**Depois (API real):**
```typescript
import { ProcessosService } from '../service/processos.service';
// ...
readonly processos = inject(ProcessosService).getProcessos();
```