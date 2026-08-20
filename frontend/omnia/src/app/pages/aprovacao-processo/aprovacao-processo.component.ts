import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

import {
  correicaoPorProcesso,
  ItemVeredito,
  Veredito,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-aprovacao-processo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './aprovacao-processo.component.html',
  styleUrl: './aprovacao-processo.component.scss',
})
export class AprovacaoProcessoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  processo = signal<string>('0801234-00.2026.8.23.0001');
  
  linhas: ItemVeredito[] = (correicaoPorProcesso['padrao'] ?? []).map(l => ({ ...l }));

  // Nova estrutura de dados focada nas tramitações judiciais reais
  readonly tramitacoes = [
    { data: '15/05/2026', texto: 'Distribuição por Sorteio' },
    { data: '16/05/2026', texto: 'Conclusão ao Juiz' },
    { data: '20/05/2026', texto: 'Despacho - Mero expediente' },
    { data: '05/06/2026', texto: 'Juntada de Petição de Manifestação' },
    { data: '08/07/2026', texto: 'Decisão determinou a expedição de ofício' },
    { data: '14/07/2026', texto: 'Arquivamento definitivo' },
  ];

  readonly condicoes = [
    'Arquivamento definitivo em 14/7/2026',
    'Determinação anterior de expedição de ofício',
    'Ausência de movimento posterior de expedição',
    'Ausência de documento de cumprimento',
  ];

  readonly documentos = [
    'Decisão de 8/7/2026',
    'Movimentos de 9 a 14/7/2026',
    'Termo de arquivamento',
  ];

  // Controles de estado
  relatorio = signal<string | null>(null);
  expandirTramitacoes = signal<boolean>(false); // Controla o dropdown da linha do tempo

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['processo']) {
        this.processo.set(params['processo']);
      }
    });
  }

  toggleVeredito(linha: ItemVeredito): void {
    const estadosPermitidos: Veredito[] = ['Atende', 'Não atende', 'Não se encaixa'];
    const indiceAtual = estadosPermitidos.indexOf(linha.veredito);
    const proximoIndice = (indiceAtual + 1) % estadosPermitidos.length;
    
    linha.veredito = estadosPermitidos[proximoIndice];
  }

  gerarRelatorio(): void {
    const naoAtende = this.linhas.filter((l) => l.veredito === 'Não atende');
    const relatorioTexto = [
      `Relatório correicional — Processo ${this.processo()}`,
      '',
      'Achados da correição automatizada (com revisão manual):',
      ...this.linhas.map((l) => `· ${l.regra} — ${l.veredito}: ${l.trecho}`),
      '',
      `Regras não atendidas: ${naoAtende.length}.`,
      '',
      'Conclusão provisória: há indício de arquivamento sem confirmação do cumprimento da determinação judicial; a conclusão depende de validação humana.',
    ].join('\n');

    this.relatorio.set(relatorioTexto);
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