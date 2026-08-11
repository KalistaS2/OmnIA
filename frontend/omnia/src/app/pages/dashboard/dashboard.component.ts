import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Plus,
  History,
  Play,
  ShieldAlert,
} from 'lucide-angular';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { RiskBadgeComponent } from '../../components/risk-badge/risk-badge.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  kpis,
  processos,
  regrasCriticas,
  evolucaoConformidade,
  correicoesRecentes,
  universoAuditoria,
  relatorioUltimaCorreicao,
  REFERENCE_PERIOD,
  Processo,
  RegraCritica,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    AppShellComponent,
    PanelComponent,
    RiskBadgeComponent,
    TagComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly referencePeriod = REFERENCE_PERIOD;
  readonly kpis = kpis;
  readonly processos: Processo[] = processos;
  readonly regrasCriticas: RegraCritica[] = regrasCriticas;
  readonly evolucaoConformidade = evolucaoConformidade;
  readonly correicoesRecentes = correicoesRecentes;
  readonly universoAuditoria = universoAuditoria;
  readonly relatorioUltimaCorreicao = relatorioUltimaCorreicao;

  readonly alertasSemPrazo = [
    '8 regras aguardando aprovação',
    '3 correições com validação pendente',
  ];

  // Ícones
  readonly PlusIcon = Plus;
  readonly ArrowUpRightIcon = ArrowUpRight;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly HistoryIcon = History;
  readonly PlayIcon = Play;
  readonly ShieldAlertIcon = ShieldAlert;

  getTrendIcon(tendencia: string) {
    if (tendencia === 'Crescente') return TrendingUp;
    if (tendencia === 'Decrescente') return TrendingDown;
    return Minus;
  }

  getTrendColor(tendencia: string): string {
    if (tendencia === 'Crescente') return 'text-risk-high';
    if (tendencia === 'Decrescente') return 'text-risk-low';
    return 'text-muted-foreground';
  }
}