# service/

Diretório de **services Angular** responsáveis pela lógica de negócio e por centralizar o acesso a dados (futura API HTTP) da aplicação OmnIA.

---

## 📁 Arquivos

| Arquivo | Descrição |
|---|---|
| `is-mobile.service.ts` | Detecta se o dispositivo é mobile com base na largura da tela |

---

## 🔌 Integração com a API

> ⚠️ **Estado atual:** Os dados da aplicação são fornecidos diretamente pelos mocks em `mock-data/prototype-data.ts`. Os services ainda não fazem chamadas HTTP reais.

Quando o backend estiver disponível, os services aqui devem:

1. Injetar `HttpClient` do Angular
2. Definir a URL base usando as variáveis de ambiente em `enviroment/`
3. Substituir as importações do `prototype-data.ts` por chamadas HTTP

**Exemplo de padrão a seguir:**
```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroment/environment';

@Injectable({ providedIn: 'root' })
export class ProcessosService {
  private http = inject(HttpClient);

  getProcessos() {
    return this.http.get(`${environment.apiUrl}/processos`);
  }
}
```

---

## 📝 Convenções

- Um service por domínio funcional (ex.: `processos.service.ts`, `regras.service.ts`, `aprovacao.service.ts`).
- Use `inject()` ao invés de injeção pelo construtor (padrão Angular moderno).
- Services devem ser `providedIn: 'root'` por padrão, a menos que sejam escopados a um módulo específico.
- Para gerar um novo service: `ng generate service service/nome-do-service`