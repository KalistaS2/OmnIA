# enviroment/

> **Nota ortográfica:** O nome da pasta segue a grafia original do projeto (`enviroment`, sem o segundo 'n'). Manter para não quebrar imports existentes.

Diretório de **variáveis de ambiente** da aplicação. Permite configurar valores diferentes para desenvolvimento, staging e produção sem alterar o código da aplicação.

---

## 📄 Arquivos Esperados

| Arquivo | Uso |
|---|---|
| `environment.ts` | Configurações para **desenvolvimento** (padrão) |
| `environment.prod.ts` | Configurações para **produção** |

---

## 🔧 Estrutura Sugerida

Crie os arquivos conforme o modelo abaixo:

**`environment.ts` (desenvolvimento):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

**`environment.prod.ts` (produção):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.omnia.tjro.jus.br',
};
```

---

## ⚙️ Configurando a Troca Automática de Ambiente

Para que o Angular use automaticamente o arquivo de produção no build, configure o `angular.json`:

```json
"fileReplacements": [
  {
    "replace": "src/app/enviroment/environment.ts",
    "with": "src/app/enviroment/environment.prod.ts"
  }
]
```

Isso já é o comportamento padrão da seção `"production"` nas configurações de build do Angular.

---

## 📝 Como Usar nos Services

```typescript
import { environment } from '../enviroment/environment';

// Usar a URL da API
const url = `${environment.apiUrl}/processos`;
```