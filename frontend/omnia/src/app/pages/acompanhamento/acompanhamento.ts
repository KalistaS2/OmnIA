import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
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
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  // Filtro de busca por unidade
  readonly busca = signal<string>('');

  // Dropdown expansível do processo em análise
  readonly detalhesProcessoAberto = signal<boolean>(true);

  // Notificação de evento (ex: conclusão de correição)
  readonly notificacaoConclusao = signal<string | null>(null);

  // Timer para simulação em tempo real
  private simulationTimer: any;

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
          { numero: 1, nome: 'Extração de metadados e histórico temporal', status: 'Concluída', detalhe: 'Dados do processo e últimas 48 movimentações indexadas.' },
          { numero: 2, nome: 'Análise de petições pendentes e despachos', status: 'Concluída', detalhe: 'Verificação de termos conclusos para sentença/despacho.' },
          { numero: 3, nome: 'Cálculo de dias úteis e prazos normativos', status: 'Em execução', detalhe: 'Analisando decurso de prazo desde o último evento útil...' },
          { numero: 4, nome: 'Identificação de causa impeditiva ou suspensão', status: 'Pendente', detalhe: 'Aguardando cálculo temporal.' },
          { numero: 5, nome: 'Consolidação e redação preliminar do achado', status: 'Pendente', detalhe: 'Aguardando validação dos passos anteriores.' },
        ],
      },
      regrasPendentes: [
        { id: 'RC-009', nome: 'Ordem judicial sem cumprimento localizado', descricao: 'Verifica determinações judiciais sem registro posterior de cumprimento.' },
        { id: 'RC-017', nome: 'Arquivamento com possível pendência', descricao: 'Identifica processos arquivados com pendências de custas ou atos pendentes.' },
      ],
    },
  });

  // Fila de unidades com processos "aguardando correição"
  readonly filaAguardando = signal<UnidadeAguardando[]>([
    { id: 'fila-01', posicao: 1, unidade: 'Vara da Fazenda Pública', comarca: 'Boa Vista', competencia: 'Fazenda Pública', totalProcessos: 4110, amostraProcessos: 822, percentualAmostra: 20, regrasSelecionadas: 4, status: 'Aguardando correição', previsaoInicio: 'Após conclusão da 1ª Vara Cível (~12 min)' },
    { id: 'fila-02', posicao: 2, unidade: '1ª Vara Criminal', comarca: 'Boa Vista', competencia: 'Criminal', totalProcessos: 2150, amostraProcessos: 430, percentualAmostra: 20, regrasSelecionadas: 3, status: 'Aguardando correição', previsaoInicio: 'Em seguida (~45 min)' },
    { id: 'fila-03', posicao: 3, unidade: 'Vara de Família e Sucessões', comarca: 'Boa Vista', competencia: 'Família', totalProcessos: 1980, amostraProcessos: 396, percentualAmostra: 20, regrasSelecionadas: 4, status: 'Aguardando correição', previsaoInicio: 'Previsão: 16:30' },
  ]);

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

  ngOnInit(): void {
    this.iniciarSimulacaoTempoReal();
  }

  ngOnDestroy(): void {
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
    }
  }

  // ==========================================================
  // LÓGICA DE SIMULAÇÃO (MOTOR FAKE OMinIA)
  // ==========================================================
  private iniciarSimulacaoTempoReal(): void {
    // Roda a cada 1.5 segundos para atualizar a tela fluidamente
    this.simulationTimer = setInterval(() => {
      this.correicaoAtiva.update((ativa) => {
        if (!ativa || ativa.status !== 'Em execução') return ativa;

        // Clonamos o objeto para disparar a reatividade corretamente
        const next = { ...ativa };
        next.processoAtual = { ...ativa.processoAtual };
        next.processoAtual.regraAtual = { 
          ...ativa.processoAtual.regraAtual, 
          etapas: ativa.processoAtual.regraAtual.etapas.map(e => ({ ...e })) 
        };
        next.processoAtual.regrasAvaliadas = [...ativa.processoAtual.regrasAvaliadas];
        next.processoAtual.regrasPendentes = [...ativa.processoAtual.regrasPendentes];

        // 1. Atualiza o relógio (Tempo Decorrido)
        next.tempoDecorrido = this.incrementarRelogio(next.tempoDecorrido);

        // 2. Simula oscilação de velocidade (entre 20 e 24 proc/min)
        const currentSpeed = 22 + (Math.floor(Math.random() * 5) - 2);
        next.velocidade = `${currentSpeed} proc./min`;

        // Estima o tempo restante baseado na velocidade
        const remainingProc = next.amostraProcessos - next.processosProcessados;
        const estMinutes = Math.max(1, Math.ceil(remainingProc / currentSpeed));
        next.tempoEstimadoRestante = `~${estMinutes} min`;

        // 3. Avança as etapas da regra atual
        const etapas = next.processoAtual.regraAtual.etapas;
        const indexExecucao = etapas.findIndex((e) => e.status === 'Em execução');

        if (indexExecucao !== -1) {
          etapas[indexExecucao].status = 'Concluída';
          etapas[indexExecucao].detalhe = 'Verificação finalizada com sucesso.';

          const proxIndex = indexExecucao + 1;
          if (proxIndex < etapas.length) {
            // Inicia a próxima fase da regra
            etapas[proxIndex].status = 'Em execução';
            etapas[proxIndex].detalhe = 'Processando e analisando dados...';
          } else {
            // A REGRA FOI FINALIZADA - Mover para avaliadas
            const achouProblema = Math.random() > 0.85; // 15% de chance de achar problema
            if (achouProblema) next.achadosApurados++;

            next.processoAtual.regrasAvaliadas.push({
              id: next.processoAtual.regraAtual.id,
              nome: next.processoAtual.regraAtual.nome,
              status: achouProblema ? 'Achado sinalizado' : 'Conforme',
              duracao: (Math.random() * 1.2 + 0.1).toFixed(1) + 's',
              detalhes: achouProblema ? 'Inconsistência encontrada pela IA.' : 'Análise concluída. Sem divergências.',
            });

            if (next.processoAtual.regrasPendentes.length > 0) {
              // Passa para a próxima regra do MESMO processo
              const proxRegra = next.processoAtual.regrasPendentes.shift()!;
              next.processoAtual.regraAtual = this.gerarMockNovaRegra(proxRegra);
            } else {
              // O PROCESSO FOI FINALIZADO - Passa para o próximo processo
              next.processosProcessados++;
              next.percentualConcluido = Math.min(100, Math.floor((next.processosProcessados / next.amostraProcessos) * 100));

              if (next.processosProcessados >= next.amostraProcessos) {
                // Todas as amostras da Unidade terminaram!
                setTimeout(() => this.finalizarCorreicaoAtiva(), 0);
                return next;
              } else {
                next.processoAtual = this.gerarMockNovoProcesso(next.processosProcessados + 1, next.amostraProcessos);
              }
            }
          }
        }
        return next;
      });
    }, 1500); // Define a velocidade visual do avanço
  }

  // Utilitário para avançar o relógio string HH:MM:SS
  private incrementarRelogio(tempo: string): string {
    const p = tempo.split(':');
    let h = parseInt(p[0], 10), m = parseInt(p[1], 10), s = parseInt(p[2], 10);
    s += 1; // Soma 1 segundo visual
    if (s >= 60) { s = 0; m++; }
    if (m >= 60) { m = 0; h++; }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private gerarMockNovaRegra(regra: RegraPendente): RegraEmExecucao {
    return {
      id: regra.id,
      nome: regra.nome,
      descricao: regra.descricao,
      etapas: [
        { numero: 1, nome: 'Coleta de evidências e metadados', status: 'Em execução', detalhe: 'Consultando base de dados...' },
        { numero: 2, nome: 'Aplicação de heurísticas da regra', status: 'Pendente' },
        { numero: 3, nome: 'Consolidação e registro de log', status: 'Pendente' }
      ]
    };
  }

  private gerarMockNovoProcesso(posicao: number, total: number): ProcessoEmAnalise {
    const rndNum = Math.floor(1000 + Math.random() * 8999);
    const ano = Math.floor(2022 + Math.random() * 4);
    return {
      numero: `080${rndNum}-22.${ano}.8.23.0001`,
      classe: 'Procedimento Comum Cível',
      assunto: 'Assunto em Avaliação',
      posicao: posicao,
      totalAmostra: total,
      dataDistribuicao: `10/03/${ano}`,
      ultimaMovimentacao: 'Recebimento automático',
      regrasAvaliadas: [],
      regraAtual: {
        id: 'RC-011',
        nome: 'Conformidade de autuação',
        descricao: 'Verificação básica de classe, assunto e partes.',
        etapas: [
          { numero: 1, nome: 'Leitura da capa do processo', status: 'Em execução', detalhe: 'Acessando metadados...' },
          { numero: 2, nome: 'Confronto com normativas', status: 'Pendente' }
        ]
      },
      regrasPendentes: [
        { id: 'RC-021', nome: 'Análise de custas', descricao: 'Verifica recolhimento de preparo.' }
      ]
    };
  }

  // ==========================================================
  // AÇÕES E MÉTODOS DE TELA
  // ==========================================================
  toggleDetalhesProcesso(): void {
    this.detalhesProcessoAberto.update((v) => !v);
  }

  limparFiltros(): void {
    this.busca.set('');
  }

  finalizarCorreicaoAtiva(): void {
    const ativa = this.correicaoAtiva();
    if (!ativa) return;

    const nomeUnidade = ativa.unidade;
    this.notificacaoConclusao.set(
      `Correição da ${nomeUnidade} finalizada com sucesso! Os achados foram encaminhados para a Central de Aprovação.`
    );

    const fila = this.filaAguardando();
    if (fila.length > 0) {
      const [proxima, ...restante] = fila;
      this.filaAguardando.set(
        restante.map((u, idx) => ({ ...u, posicao: idx + 1 }))
      );

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
              { numero: 1, nome: 'Extração de metadados e histórico temporal', status: 'Em execução', detalhe: 'Indexando autos digitais e certidões...' },
              { numero: 2, nome: 'Análise de petições pendentes', status: 'Pendente' },
              { numero: 3, nome: 'Identificação de causa impeditiva', status: 'Pendente' }
            ],
          },
          regrasPendentes: [
            { id: 'RC-009', nome: 'Ordem judicial sem cumprimento', descricao: 'Verifica determinações judiciais pendentes.' }
          ],
        },
      });
    } else {
      this.correicaoAtiva.set(null);
    }
  }

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