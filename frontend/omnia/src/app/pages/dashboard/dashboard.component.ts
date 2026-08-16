import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  kpis,
  unidades,
  regrasCriticas,
  evolucaoConformidade,
  correicoesRecentes,
  universoAuditoria,
  relatorioUltimaCorreicao,
  REFERENCE_PERIOD,
  Unidade,
  RegraCritica,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly referencePeriod = REFERENCE_PERIOD;
  readonly kpis = kpis;
  readonly unidades: Unidade[] = unidades;
  readonly regrasCriticas: RegraCritica[] = regrasCriticas;
  readonly evolucaoConformidade = evolucaoConformidade;
  readonly correicoesRecentes = correicoesRecentes;
  readonly universoAuditoria = universoAuditoria;
  readonly relatorioUltimaCorreicao = relatorioUltimaCorreicao;

  // Estados reativos
  readonly busca = signal<string>('');
  readonly mostrarSugestoes = signal<boolean>(false);

  readonly alertasSemPrazo = [
    '1ª Vara Cível: 48 processos correicionados aguardando validação',
    'Vara da Fazenda Pública: 29 achados com revisão pendente',
    '8 novas regras aguardando homologação da Corregedoria',
  ];

  // Sugestões no dropdown de pesquisa conforme digitação
  readonly sugestoes = computed<Unidade[]>(() => {
    const termo = this.busca().trim().toLowerCase();
    if (!termo) {
      return this.unidades;
    }
    return this.unidades.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.competencia.toLowerCase().includes(termo) ||
        u.comarca.toLowerCase().includes(termo)
    );
  });

  // Unidades filtradas pela busca
  readonly unidadesFiltradas = computed<Unidade[]>(() => {
    const termo = this.busca().trim().toLowerCase();

    return this.unidades.filter((u) => {
      return (
        !termo ||
        u.nome.toLowerCase().includes(termo) ||
        u.competencia.toLowerCase().includes(termo) ||
        u.comarca.toLowerCase().includes(termo)
      );
    });
  });

  // Métricas agregadas
  readonly resumoGeral = computed(() => {
    const list = this.unidades;
    const totalProcessos = list.reduce((acc, u) => acc + u.totalProcessos, 0);
    const processosPendentes = list.reduce((acc, u) => acc + u.processosPendentes, 0);
    const pendentesValidacao = list.reduce((acc, u) => acc + u.pendentesValidacao, 0);
    const achadosCriticos = list.reduce((acc, u) => acc + u.achadosCriticos, 0);
    const mediaConformidade = Math.round(
      list.reduce((acc, u) => acc + u.conformidade, 0) / (list.length || 1)
    );

    return {
      totalProcessos,
      processosPendentes,
      pendentesValidacao,
      achadosCriticos,
      mediaConformidade,
    };
  });

  onBuscaChange(valor: string): void {
    this.busca.set(valor);
    this.mostrarSugestoes.set(true);
  }

  onBuscaFocus(): void {
    this.mostrarSugestoes.set(true);
  }

  onBuscaBlur(): void {
    setTimeout(() => {
      this.mostrarSugestoes.set(false);
    }, 200);
  }

  selecionarSugestao(nome: string): void {
    this.busca.set(nome);
    this.mostrarSugestoes.set(false);
  }

  limparFiltros(): void {
    this.busca.set('');
    this.mostrarSugestoes.set(false);
  }

  getTrendIcon(tendencia: string): string {
    if (tendencia === 'Crescente') return 'trending_up';
    if (tendencia === 'Decrescente') return 'trending_down';
    return 'trending_flat';
  }

  getTrendColor(tendencia: string): string {
    if (tendencia === 'Crescente') return 'text-risk-high';
    if (tendencia === 'Decrescente') return 'text-risk-low';
    return 'text-muted-foreground';
  }

  getConformidadeBarColor(valor: number): string {
    if (valor >= 90) return 'bg-risk-low';
    if (valor >= 80) return 'bg-risk-medium';
    return 'bg-risk-high';
  }
}