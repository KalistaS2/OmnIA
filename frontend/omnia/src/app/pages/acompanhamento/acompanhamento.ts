import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

export interface RegraAvaliada {
  id: string;
  nome: string;
  status: 'Conforme' | 'Achado sinalizado';
  duracao: string;
  detalhes: string;
}

export interface EtapaRegra {
  numero: number;
  nome: string;
  status: 'Concluída' | 'Em execução' | 'Pendente';
  detalhe?: string;
}

export interface RegraEmExecucao {
  id: string;
  nome: string;
  descricao: string;
  etapas: EtapaRegra[];
}

export interface RegraPendente {
  id: string;
  nome: string;
  descricao: string;
}

export interface ProcessoEmAnalise {
  numero: string;
  classe: string;
  assunto: string;
  posicao: number;
  totalAmostra: number;
  dataDistribuicao: string;
  ultimaMovimentacao: string;
  regrasAvaliadas: RegraAvaliada[];
  regraAtual: RegraEmExecucao;
  regrasPendentes: RegraPendente[];
}

export interface CorreicaoAtiva {
  id: string;
  unidade: string;
  comarca: string;
  competencia: string;
  totalProcessos: number;
  amostraProcessos: number;
  processosProcessados: number;
  percentualConcluido: number;
  tempoDecorrido: string;
  tempoEstimadoRestante: string;
  velocidade: string;
  achadosApurados: number;
  regrasTotal: number;
  status: 'Em execução' | 'Pausado';
  processoAtual: ProcessoEmAnalise;
}

export interface UnidadeAguardando {
  id: string;
  posicao: number;
  unidade: string;
  comarca: string;
  competencia: string;
  totalProcessos: number;
  amostraProcessos: number;
  percentualAmostra: number;
  regrasSelecionadas: number;
  status: 'Aguardando correição';
  previsaoInicio: string;
}

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './acompanhamento.html',
  styleUrl: './acompanhamento.scss',
})
export class AcompanhamentoComponent {
  // Filtro de busca por unidade
  readonly busca = signal<string>('');

  // Dropdown expansível do processo em análise
  readonly detalhesProcessoAberto = signal<boolean>(true);

  // Notificação de evento (ex: conclusão de correição)
  readonly notificacaoConclusao = signal<string | null>(null);

  // Unidade que está sendo correicionada no momento
  readonly correicaoAtiva = signal<CorreicaoAtiva | null>({
    id: 'corr-01',
    unidade: '1ª Vara Cível',
    comarca: 'Boa Vista',
    competencia: 'Cível Geral',
    totalProcessos: 3420,
    amostraProcessos: 684,
    processosProcessados: 412,
    percentualConcluido: 60,
    tempoDecorrido: '00:18:42',
    tempoEstimadoRestante: '~12 min',
    velocidade: '22 proc./min',
    achadosApurados: 18,
    regrasTotal: 5,
    status: 'Em execução',
    processoAtual: {
      numero: '0801234-00.2026.8.23.0001',
      classe: 'Procedimento Comum Cível',
      assunto: 'Obrigação de Fazer',
      posicao: 412,
      totalAmostra: 684,
      dataDistribuicao: '14/02/2024',
      ultimaMovimentacao: 'Certidão de decurso de prazo juntada aos autos',
      regrasAvaliadas: [
        {
          id: 'RC-012',
          nome: 'Classe ou assunto incompatível',
          status: 'Conforme',
          duracao: '0.3s',
          detalhes: 'Conformidade cadastral validada na TPU/CNJ.',
        },
        {
          id: 'RC-015',
          nome: 'Movimentações potencialmente redundantes',
          status: 'Conforme',
          duracao: '0.5s',
          detalhes: 'Histórico de eventos sem duplicação ou movimentação em looping.',
        },
      ],
      regraAtual: {
        id: 'RC-004',
        nome: 'Processos paralisados além do prazo',
        descricao: 'Varredura de decurso temporal e ausência de movimentação útil por mais de 120 dias.',
        etapas: [
          {
            numero: 1,
            nome: 'Extração de metadados e histórico temporal',
            status: 'Concluída',
            detalhe: 'Dados do processo e últimas 48 movimentações indexadas.',
          },
          {
            numero: 2,
            nome: 'Análise de petições pendentes e despachos',
            status: 'Concluída',
            detalhe: 'Verificação de termos conclusos para sentença/despacho.',
          },
          {
            numero: 3,
            nome: 'Cálculo de dias úteis e prazos normativos',
            status: 'Em execução',
            detalhe: 'Analisando decurso de prazo desde o último evento útil...',
          },
          {
            numero: 4,
            nome: 'Identificação de causa impeditiva ou suspensão',
            status: 'Pendente',
            detalhe: 'Aguardando cálculo temporal.',
          },
          {
            numero: 5,
            nome: 'Consolidação e redação preliminar do achado',
            status: 'Pendente',
            detalhe: 'Aguardando validação dos passos anteriores.',
          },
        ],
      },
      regrasPendentes: [
        {
          id: 'RC-009',
          nome: 'Ordem judicial sem cumprimento localizado',
          descricao: 'Verifica determinações judiciais sem registro posterior de cumprimento.',
        },
        {
          id: 'RC-017',
          nome: 'Arquivamento com possível pendência',
          descricao: 'Identifica processos arquivados com pendências de custas ou atos pendentes.',
        },
      ],
    },
  });

  // Fila de unidades com processos "aguardando correição"
  readonly filaAguardando = signal<UnidadeAguardando[]>([
    {
      id: 'fila-01',
      posicao: 1,
      unidade: 'Vara da Fazenda Pública',
      comarca: 'Boa Vista',
      competencia: 'Fazenda Pública',
      totalProcessos: 4110,
      amostraProcessos: 822,
      percentualAmostra: 20,
      regrasSelecionadas: 4,
      status: 'Aguardando correição',
      previsaoInicio: 'Após conclusão da 1ª Vara Cível (~12 min)',
    },
    {
      id: 'fila-02',
      posicao: 2,
      unidade: '1ª Vara Criminal',
      comarca: 'Boa Vista',
      competencia: 'Criminal',
      totalProcessos: 2150,
      amostraProcessos: 430,
      percentualAmostra: 20,
      regrasSelecionadas: 3,
      status: 'Aguardando correição',
      previsaoInicio: 'Em seguida (~45 min)',
    },
    {
      id: 'fila-03',
      posicao: 3,
      unidade: 'Vara de Família e Sucessões',
      comarca: 'Boa Vista',
      competencia: 'Família',
      totalProcessos: 1980,
      amostraProcessos: 396,
      percentualAmostra: 20,
      regrasSelecionadas: 4,
      status: 'Aguardando correição',
      previsaoInicio: 'Previsão: 16:30',
    },
  ]);

  // --- Computed Signals ---

  // Verifica se a unidade ativa atende à busca
  readonly mostrarUnidadeAtiva = computed<boolean>(() => {
    const ativa = this.correicaoAtiva();
    if (!ativa) return false;

    const termo = this.busca().trim().toLowerCase();
    if (!termo) return true;

    return (
      ativa.unidade.toLowerCase().includes(termo) ||
      ativa.competencia.toLowerCase().includes(termo) ||
      ativa.comarca.toLowerCase().includes(termo)
    );
  });

  // Fila de espera filtrada pela busca
  readonly filaFiltrada = computed<UnidadeAguardando[]>(() => {
    const termo = this.busca().trim().toLowerCase();
    const lista = this.filaAguardando();

    if (!termo) return lista;

    return lista.filter(
      (u) =>
        u.unidade.toLowerCase().includes(termo) ||
        u.competencia.toLowerCase().includes(termo) ||
        u.comarca.toLowerCase().includes(termo)
    );
  });

  // --- Construtor com suporte a QueryParams ---

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      const nomeUnidade = params['unidade'];
      if (nomeUnidade && this.correicaoAtiva()?.unidade !== nomeUnidade) {
        const naFila = this.filaAguardando().find((u) => u.unidade === nomeUnidade);
        if (naFila) {
          this.priorizarNaFila(naFila.id);
        }
      }
    });
  }

  // --- Ações e Métodos ---

  toggleDetalhesProcesso(): void {
    this.detalhesProcessoAberto.update((v) => !v);
  }

  limparFiltros(): void {
    this.busca.set('');
  }

  // Ao finalizar uma correição, ela é removida da página e a próxima da fila assume a execução
  finalizarCorreicaoAtiva(): void {
    const ativa = this.correicaoAtiva();
    if (!ativa) return;

    const nomeUnidade = ativa.unidade;
    this.notificacaoConclusao.set(
      `Correição da ${nomeUnidade} finalizada com sucesso! Os achados foram encaminhados para a Central de Aprovação.`
    );

    // Remove a correição finalizada (não exibindo finalizados na página)
    const fila = this.filaAguardando();
    if (fila.length > 0) {
      const [proxima, ...restante] = fila;
      this.filaAguardando.set(
        restante.map((u, idx) => ({ ...u, posicao: idx + 1 }))
      );

      // Inicia a próxima unidade
      this.correicaoAtiva.set({
        id: 'corr-' + proxima.id,
        unidade: proxima.unidade,
        comarca: proxima.comarca,
        competencia: proxima.competencia,
        totalProcessos: proxima.totalProcessos,
        amostraProcessos: proxima.amostraProcessos,
        processosProcessados: 1,
        percentualConcluido: 1,
        tempoDecorrido: '00:00:15',
        tempoEstimadoRestante: '~35 min',
        velocidade: '20 proc./min',
        achadosApurados: 0,
        regrasTotal: proxima.regrasSelecionadas,
        status: 'Em execução',
        processoAtual: {
          numero: '0808219-05.2025.8.23.0003',
          classe: 'Execução Fiscal',
          assunto: 'IPTU / Imposto Predial',
          posicao: 1,
          totalAmostra: proxima.amostraProcessos,
          dataDistribuicao: '05/08/2025',
          ultimaMovimentacao: 'Distribuição automática realizada',
          regrasAvaliadas: [],
          regraAtual: {
            id: 'RC-004',
            nome: 'Processos paralisados além do prazo',
            descricao: 'Varredura de decurso temporal e ausência de movimentação útil.',
            etapas: [
              {
                numero: 1,
                nome: 'Extração de metadados e histórico temporal',
                status: 'Em execução',
                detalhe: 'Indexando autos digitais e certidões...',
              },
              {
                numero: 2,
                nome: 'Análise de petições pendentes e despachos',
                status: 'Pendente',
              },
              {
                numero: 3,
                nome: 'Cálculo de dias úteis e prazos normativos',
                status: 'Pendente',
              },
              {
                numero: 4,
                nome: 'Identificação de causa impeditiva ou suspensão',
                status: 'Pendente',
              },
              {
                numero: 5,
                nome: 'Consolidação e redação preliminar do achado',
                status: 'Pendente',
              },
            ],
          },
          regrasPendentes: [
            {
              id: 'RC-009',
              nome: 'Ordem judicial sem cumprimento localizado',
              descricao: 'Verifica determinações judiciais pendentes de cumprimento.',
            },
            {
              id: 'RC-012',
              nome: 'Classe ou assunto incompatível',
              descricao: 'Identifica divergência entre classe e assunto cadastrados.',
            },
          ],
        },
      });
    } else {
      // Sem mais unidades na fila
      this.correicaoAtiva.set(null);
    }
  }

  // Prioriza uma unidade da fila para ser a próxima
  priorizarNaFila(id: string): void {
    const lista = [...this.filaAguardando()];
    const index = lista.findIndex((u) => u.id === id);
    if (index > 0) {
      const [item] = lista.splice(index, 1);
      lista.unshift(item);
      this.filaAguardando.set(
        lista.map((u, idx) => ({ ...u, posicao: idx + 1 }))
      );
    }
  }

  fecharNotificacao(): void {
    this.notificacaoConclusao.set(null);
  }
}
