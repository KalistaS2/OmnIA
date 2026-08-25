import { Injectable, signal, computed } from '@angular/core';
import { Notificacao } from '../models/notificacao.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notificacoes = signal<Notificacao[]>([
    {
      id: 'notif-1',
      titulo: 'Processos aguardando validação',
      unidade: '1ª Vara Cível',
      descricao: '48 processos correicionados aguardando validação da equipe.',
      tempo: 'Há 15 min',
      tipo: 'atencao',
      icone: 'warning',
      lida: false,
      rota: '/aprovacao',
      queryParams: { unidade: '1ª Vara Cível' },
      acaoTexto: 'Validar processos',
    },
    {
      id: 'notif-3',
      titulo: 'Homologação de regras',
      unidade: 'Corregedoria',
      descricao: '8 novas regras aguardando homologação da Corregedoria.',
      tempo: 'Há 2 horas',
      tipo: 'info',
      icone: 'verified_user',
      lida: false,
      rota: '/checklist',
      acaoTexto: 'Acessar regras',
    },
  ]);

  readonly notificacoes = this._notificacoes.asReadonly();

  readonly totalNaoLidas = computed(
    () => this._notificacoes().filter((n) => !n.lida).length
  );

  marcarComoLida(id: string): void {
    this._notificacoes.update((list) =>
      list.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }

  marcarTodasComoLidas(): void {
    this._notificacoes.update((list) => list.map((n) => ({ ...n, lida: true })));
  }

  removerNotificacao(id: string): void {
    this._notificacoes.update((list) => list.filter((n) => n.id !== id));
  }

  adicionarNotificacao(notif: Omit<Notificacao, 'id' | 'lida'>): void {
    const nova: Notificacao = {
      ...notif,
      id: `notif-${Date.now()}`,
      lida: false,
    };
    this._notificacoes.update((list) => [nova, ...list]);
  }
}
