import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';
import { ParecerModalComponent } from '../../components/parecer-modal/parecer-modal.component';

import {
  correicaoPorProcesso,
  ItemVeredito,
  Veredito,
} from '../../mock-data/prototype-data';

import { ParecerService } from '../../services/parecer.service';
import { Parecer, AnotacaoClassificada, AnotacaoCategoria } from '../../models/parecer.model';

@Component({
  selector: 'app-aprovacao-processo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppShellComponent,
    PanelComponent,
    TagComponent,
    ParecerModalComponent,
  ],
  templateUrl: './aprovacao-processo.component.html',
  styleUrl: './aprovacao-processo.component.scss',
})
export class AprovacaoProcessoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private parecerService = inject(ParecerService);

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

  readonly decisoes = [
    { label: 'Aprovar correição', icon: 'check_circle' },
    { label: 'Descartar achado', icon: 'cancel' },
    { label: 'Solicitar revisão', icon: 'replay' },
    { label: 'Encaminhar à unidade', icon: 'send' },
  ];

  // Estados reativos (Signals)
  decisao = signal<string | null>(null);
  anotacao = signal<string>('');
  anotacoes = signal<AnotacaoClassificada[]>([]);

  // Parecer
  parecer = signal<Parecer | null>(null);
  parecerAberto = signal<boolean>(false);
  parecerGerado = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['processo']) {
        this.processo.set(params['processo']);
      }
    });
  }

  adicionarAnotacao(): void {
    const texto = this.anotacao().trim();
    if (!texto) return;
    const categoria = this.parecerService.classificarAnotacao(texto);
    this.anotacoes.update((a) => [...a, { texto, categoria }]);
    this.anotacao.set('');
  }

  /**
   * Retorna o label e a classe CSS do badge para cada categoria de anotação.
   * PONTO DE EXTENSÃO FUTURA: quando a classificação migrar para LLM,
   * este método permanece inalterado — apenas o retorno de `classificarAnotacao()`
   * passará a vir de uma chamada assíncrona.
   */
  badgeCategoria(cat: AnotacaoCategoria): { label: string; css: string } {
    const map: Record<AnotacaoCategoria, { label: string; css: string }> = {
      contexto:      { label: 'Contexto',      css: 'badge-contexto' },
      justificativa: { label: 'Justificativa', css: 'badge-justificativa' },
      atenuante:     { label: 'Atenuante',     css: 'badge-atenuante' },
      agravante:     { label: 'Agravante',     css: 'badge-agravante' },
      providencia:   { label: 'Providência',   css: 'badge-providencia' },
      livre:         { label: 'Livre',         css: 'badge-livre' },
    };
    return map[cat];
  }

  gerarRelatorio(): void {
    const novoParecer = this.parecerService.gerarParecer({
      processo: this.processo(),
      linhas: this.linhas,
      decisaoHumana: this.decisao(),
      anotacoes: this.anotacoes(),
      timeline: this.timeline,
      relator: 'Dra. Helena',
    });

    this.parecer.set(novoParecer);
    this.parecerGerado.set(true);
    this.parecerAberto.set(true);

    // Remove a mensagem de sucesso após 5 segundos
    setTimeout(() => this.parecerGerado.set(false), 5000);
  }

  removerAnotacao(index: number): void {
    this.anotacoes.update((a) => a.filter((_, i) => i !== index));
  }

  fecharParecer(): void {
    this.parecerAberto.set(false);
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