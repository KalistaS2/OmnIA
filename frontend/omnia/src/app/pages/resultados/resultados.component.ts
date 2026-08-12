import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  resultadoPorRegra,
  distribuicaoSituacao,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './resultados.component.html',
})
export class ResultadosComponent {
  readonly resultadoPorRegra = resultadoPorRegra;
  readonly distribuicaoSituacao = distribuicaoSituacao;

  // Estado da regra selecionada (Signal)
  regraSel = signal<string | null>(null);

  // Valor máximo para cálculo das barras percentuais
  readonly totalMax = Math.max(...resultadoPorRegra.map((r) => r.sinalizados));

  readonly metricas = [
    ['Processos examinados', '12.480'],
    ['Regras aplicadas', '8'],
    ['Ocorrências potenciais', '1.438'],
    ['Ocorrências críticas', '392'],
    ['Risco médio ou baixo', '1.046'],
    ['Casos inconclusivos', '164'],
    ['Conformidade preliminar', '86%'],
    ['Modo de execução', 'Somente leitura'],
  ];

  toggleRegra(regraNome: string): void {
    this.regraSel.update((curr) => (curr === regraNome ? null : regraNome));
  }

  getPercentual(sinalizados: number): number {
    return (sinalizados / this.totalMax) * 100;
  }
}