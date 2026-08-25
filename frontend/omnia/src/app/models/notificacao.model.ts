export type NotificacaoTipo = 'alerta' | 'atencao' | 'info';

export interface Notificacao {
  id: string;
  titulo: string;
  unidade?: string;
  descricao: string;
  tempo: string;
  tipo: NotificacaoTipo;
  icone: string;
  lida: boolean;
  rota?: string;
  queryParams?: Record<string, string>;
  acaoTexto?: string;
}
