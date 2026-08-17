import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { RiskBadgeComponent } from '../../components/risk-badge/risk-badge.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  biblioteca,
  processos,
  unidades,
  Processo,
  RegraBiblioteca,
  Unidade,
} from '../../mock-data/prototype-data';

export interface PacoteRegras {
  id: string;
  nome: string;
  descricao: string;
  regras: string[];
  icone: string;
  destaque?: boolean;
}

@Component({
  selector: 'app-planejamento',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AppShellComponent,
    PanelComponent,
    RiskBadgeComponent,
    TagComponent,
  ],
  templateUrl: './planejamento.component.html',
  styleUrl: './planejamento.component.scss',
})
export class PlanejamentoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  readonly unidadesLista: Unidade[] = unidades;
  readonly bibliotecaRegras: RegraBiblioteca[] = biblioteca;
  readonly processosBase: Processo[] = processos;

  // Pacotes pré-definidos de regras
  readonly pacotesRegras: PacoteRegras[] = [
    {
      id: 'civel-padrao',
      nome: 'Pacote Cível Recomendado',
      descricao: 'Regras essenciais para varas cíveis: paralisações, cumprimento de ordens e saneamento.',
      regras: ['RC-004', 'RC-009', 'RC-012', 'RC-017', 'RC-021'],
      icone: 'gavel',
      destaque: true,
    },
    {
      id: 'prazos-paralisacoes',
      nome: 'Foco em Prazos e Paralisações',
      descricao: 'Identifica processos com excesso de prazo, medidas urgentes e ordens sem cumprimento.',
      regras: ['RC-004', 'RC-009', 'RC-021'],
      icone: 'timer',
    },
    {
      id: 'qualidade-dados',
      nome: 'Qualidade Cadastral e Metadados',
      descricao: 'Validação de classes, assuntos, movimentações redundantes e arquivamentos indevidos.',
      regras: ['RC-012', 'RC-015', 'RC-017'],
      icone: 'fact_check',
    },
    {
      id: 'auditoria-completa',
      nome: 'Auditoria Integral',
      descricao: 'Aplica todas as regras disponíveis da biblioteca correicional.',
      regras: ['RC-004', 'RC-009', 'RC-012', 'RC-015', 'RC-017', 'RC-021'],
      icone: 'rule',
    },
  ];

  readonly SITUACOES = ['Todas', 'Ativo', 'Suspenso', 'Arquivado'];

  // Estados do Stepper / Fluxo em Etapas
  readonly etapaAtual = signal<number>(1);
  readonly etapasConcluidas = signal<number[]>([]);

  // Etapa 1: Seleção de Unidade
  readonly buscaUnidade = signal<string>('');
  readonly unidadeSelecionada = signal<string>('1ª Vara Cível');

  // Etapa 2: Seleção de Amostragem (10%, 20%, 30%)
  readonly amostragem = signal<10 | 20 | 30>(20);
  readonly situacaoFiltro = signal<string>('Todas');
  readonly classeFiltro = signal<string>('');
  readonly assuntoFiltro = signal<string>('');

  // Etapa 3: Seleção de Regras
  readonly modoRegras = signal<'pacotes' | 'individual'>('pacotes');
  readonly pacoteSelecionado = signal<string>('civel-padrao');
  readonly regrasSelecionadas = signal<string[]>([
    'RC-004',
    'RC-009',
    'RC-012',
    'RC-017',
    'RC-021',
  ]);
  readonly buscaRegra = signal<string>('');

  ngOnInit(): void {
    // Pré-selecionar unidade vinda da URL se houver
    this.route.queryParams.subscribe((params) => {
      if (params['unidade']) {
        const existe = this.unidadesLista.some((u) => u.nome === params['unidade']);
        if (existe) {
          this.unidadeSelecionada.set(params['unidade']);
        }
      }
    });
  }

  // --- Computed Signals ---

  // Unidade ativa como objeto
  readonly unidadeAtual = computed<Unidade | undefined>(() => {
    return this.unidadesLista.find((u) => u.nome === this.unidadeSelecionada()) || this.unidadesLista[0];
  });

  // Unidades filtradas pela busca na Etapa 1
  readonly unidadesFiltradas = computed<Unidade[]>(() => {
    const termo = this.buscaUnidade().trim().toLowerCase();
    if (!termo) return this.unidadesLista;

    return this.unidadesLista.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.competencia.toLowerCase().includes(termo) ||
        u.comarca.toLowerCase().includes(termo)
    );
  });

  // Quantidade calculada de processos amostrados
  readonly processosAmostradosQtd = computed<number>(() => {
    const acervo = this.unidadeAtual()?.totalProcessos || 3000;
    return Math.round((acervo * this.amostragem()) / 100);
  });

  // Processos da amostra filtrados para exibição
  readonly listaProcessosAmostra = computed<Processo[]>(() => {
    const uNome = this.unidadeSelecionada();
    const sit = this.situacaoFiltro();
    const c = this.classeFiltro().toLowerCase();
    const a = this.assuntoFiltro().toLowerCase();

    return this.processosBase.filter(
      (p) =>
        (p.unidade === uNome || this.processosBase.length <= 5) &&
        (sit === 'Todas' || p.situacao === sit) &&
        p.classe.toLowerCase().includes(c) &&
        p.assunto.toLowerCase().includes(a)
    );
  });

  // Regras da biblioteca filtradas na Etapa 3
  readonly regrasFiltradas = computed<RegraBiblioteca[]>(() => {
    const b = this.buscaRegra().toLowerCase();
    return this.bibliotecaRegras.filter(
      (r) => r.nome.toLowerCase().includes(b) || r.id.toLowerCase().includes(b)
    );
  });

  // Regras atualmente selecionadas como objetos
  readonly regrasSelecionadasObjetos = computed<RegraBiblioteca[]>(() => {
    return this.bibliotecaRegras.filter((r) =>
      this.regrasSelecionadas().includes(r.id)
    );
  });

  // --- Métodos de Navegação do Stepper ---

  isEtapaConcluida(etapa: number): boolean {
    return this.etapasConcluidas().includes(etapa);
  }

  podeAcessarEtapa(etapa: number): boolean {
    return etapa <= this.etapaAtual() || this.isEtapaConcluida(etapa);
  }

  irParaEtapa(etapa: number): void {
    if (this.podeAcessarEtapa(etapa)) {
      if (etapa < this.etapaAtual()) {
        this.reverterAndamentoPara(etapa);
      }
      this.etapaAtual.set(etapa);
    }
  }

  avancarParaEtapa2(): void {
    if (!this.unidadeSelecionada()) return;
    this.marcarConcluida(1);
    this.etapaAtual.set(2);
  }

  avancarParaEtapa3(): void {
    this.marcarConcluida(2);
    this.etapaAtual.set(3);
  }

  voltarEtapa(): void {
    if (this.etapaAtual() > 1) {
      const novaEtapa = this.etapaAtual() - 1;
      this.reverterAndamentoPara(novaEtapa);
      this.etapaAtual.set(novaEtapa);
    }
  }

  private reverterAndamentoPara(etapa: number): void {
    // Remove do histórico de concluídas todas as etapas a partir da etapa atual de destino
    this.etapasConcluidas.update((lista) => lista.filter((e) => e < etapa));
  }

  private marcarConcluida(etapa: number): void {
    this.etapasConcluidas.update((lista) => {
      return lista.includes(etapa) ? lista : [...lista, etapa];
    });
  }

  // --- Métodos de Seleção ---

  selecionarUnidade(nome: string): void {
    this.unidadeSelecionada.set(nome);
  }

  selecionarAmostragem(perc: 10 | 20 | 30): void {
    this.amostragem.set(perc);
  }

  selecionarModoRegras(modo: 'pacotes' | 'individual'): void {
    this.modoRegras.set(modo);
  }

  selecionarPacote(pacote: PacoteRegras): void {
    this.pacoteSelecionado.set(pacote.id);
    this.regrasSelecionadas.set([...pacote.regras]);
  }

  toggleRegra(id: string): void {
    this.regrasSelecionadas.update((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  selecionarTodasRegras(): void {
    this.regrasSelecionadas.set(this.bibliotecaRegras.map((r) => r.id));
  }

  desmarcarTodasRegras(): void {
    this.regrasSelecionadas.set([]);
  }
}