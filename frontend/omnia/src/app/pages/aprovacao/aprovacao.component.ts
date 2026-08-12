import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  correicaoPorProcesso,
  processos,
  Processo,
  ItemVeredito,
  Veredito,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-aprovacao',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './aprovacao.component.html',
})
export class AprovacaoComponent {
  readonly processos: Processo[] = processos;
  readonly linhasPadrao: ItemVeredito[] = correicaoPorProcesso['padrao'] ?? [];

  readonly etapas = [
    'Preparando o universo',
    'Estruturando movimentos e documentos',
    'Aplicando oito regras',
    'Verificando exceções',
    'Agrupando evidências',
    'Classificando achados',
    'Preparando o painel correicional',
  ];

  readonly resumoItems = [
    ['Unidade', '1ª Vara Cível'],
    ['Universo', '12.480 processos'],
    ['Regras selecionadas', '8'],
    ['Regra nova', 'RC-017 — Arquivamento com possível pendência'],
    ['Fonte', 'Réplica analítica autorizada'],
    ['Modo', 'Somente leitura'],
    ['Responsável pela aprovação', 'Dra. Helena Moreira'],
    ['Versão do checklist', '1.0 · 8/8/2026'],
  ];

  readonly governancaItems = [
    ['Quem selecionou as regras', 'Marina Alves · 6/8/2026'],
    ['Quem criou a RC-017', 'Dra. Helena Moreira · 7/8/2026'],
    ['Quem revisou', 'Marina Alves · 7/8/2026'],
    ['Quem aprovou', 'Dra. Helena Moreira · 8/8/2026'],
    ['Versão utilizada', 'Checklist 1.0 · RC-017 v1.0'],
    ['Parâmetros aplicados', 'Período 1º/1/2026 a 31/7/2026, exceções ativas'],
  ];

  // Estados reativos (Signals)
  progresso = signal<number>(-1);
  aberto = signal<string | null>(null);

  iniciar(): void {
    this.progresso.set(0);
    this.etapas.forEach((_, i) => {
      setTimeout(() => {
        this.progresso.set(i + 1);
      }, (i + 1) * 700);
    });
  }

  toggleAberto(numero: string): void {
    this.aberto.update((curr) => (curr === numero ? null : numero));
  }

  getVereditoClass(v: Veredito): string {
    const map: Record<Veredito, string> = {
      Atende: 'bg-risk-low-soft text-risk-low',
      'Não atende': 'bg-risk-high-soft text-risk-high',
      'Não se encaixa': 'bg-secondary text-muted-foreground',
    };
    return map[v] || '';
  }
}