# guard/

Diretório de **guards de rota** do Angular. Guards controlam o acesso a rotas com base em condições (autenticação, perfil de usuário, tipo de dispositivo, etc.).

---

## 📁 Estado Atual

O diretório está preparado para receber guards quando necessário. Nenhum guard está ativo nas rotas por enquanto.

---

## 🔐 Guards Planejados

| Guard | Finalidade |
|---|---|
| `auth.guard.ts` | Redirecionar para login se o usuário não estiver autenticado |
| `role.guard.ts` | Restringir acesso por perfil (ex.: somente corregedor pode aprovar) |
| `mobile.guard.ts` | Exibir aviso caso o dispositivo não suporte a experiência completa |

---

## 📝 Como criar um guard

```bash
ng generate guard guard/nome-do-guard
```

**Exemplo de guard funcional (Angular moderno):**
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  return router.parseUrl('/login');
};
```

**Aplicar na rota (`app.routes.ts`):**
```typescript
{ path: 'aprovacao', component: AprovacaoComponent, canActivate: [authGuard] }
```