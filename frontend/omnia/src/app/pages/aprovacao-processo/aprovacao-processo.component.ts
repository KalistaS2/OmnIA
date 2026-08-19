import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';
import { ParecerModalComponent } from '../../components/parecer-modal/parecer-modal.component';

import {
  correicaoPorProcesso,
  detalhesRegra,
  ItemVeredito,
  Veredito,
  DetalheRegraInfo,
  EventoTramitacao,
} from '../../mock-data/prototype-data';

import { ParecerService } from '../../services/parecer.service';
import { Parecer, AnotacaoClassificada, AnotacaoCategoria } from '../../models/parecer.model';

@Component({
  selector: 'app-aprovacao-processo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
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
  readonly linhas: ItemVeredito[] = correicaoPorProcesso['padrao'] ?? [];

  readonly timeline: EventoTramitacao[] = [
    {
      data: '3/6/2026',
      texto: 'Petição inicial distribuída para a 1ª Vara Cível',
      tipo: 'movimento',
      tone: 'bg-secondary',
    },
    {
      data: '15/6/2026',
      texto: 'Citação do réu realizada por oficial de justiça',
      tipo: 'documento',
      tone: 'bg-secondary',
    },
    {
      data: '1/7/2026',
      texto: 'Contestação juntada pelo réu',
      tipo: 'movimento',
      tone: 'bg-secondary',
    },
    {
      data: '8/7/2026',
      texto: 'Decisão determinou a expedição de ofício ao órgão requisitado',
      tipo: 'decisao',
      tone: 'bg-info-soft',
      destaque: true,
    },
    {
      data: '9 a 13/7/2026',
      texto: 'Cumprimento não localizado nos movimentos e documentos do período',
      tipo: 'achado',
      tone: 'bg-risk-medium-soft',
      destaque: true,
      achado: 'RC-009 — Ordem judicial sem cumprimento localizado',
    },
    {
      data: '14/7/2026',
      texto: 'Arquivamento definitivo sem registro de cumprimento da determinação',
      tipo: 'achado',
      tone: 'bg-risk-high-soft',
      destaque: true,
      achado: 'RC-017 — Arquivamento com possível pendência',
    },
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

  // Regra expandida no accordion inline
  regraExpandida = signal<string | null>(null);

  // Estados reativos (Signals)
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
      // Ao retornar da página de edição, reabre o modal com o parecer atualizado
      if (params['abrirParecer'] === '1') {
        const parecerAtualizado = this.parecerService.parecerAtivo();
        if (parecerAtualizado) {
          this.parecer.set(parecerAtualizado);
          this.parecerAberto.set(true);
        }
      }
    });
  }

  /** Alterna a regra expandida no accordion de detalhes */
  toggleRegraDetalhe(regraId: string): void {
    this.regraExpandida.update((curr) => (curr === regraId ? null : regraId));
  }

  /**
   * Extrai o código RC-XXX do nome completo da regra.
   * Ex.: "RC-017 — Arquivamento com possível pendência" → "RC-017"
   */
  extrairIdRegra(nomeRegra: string): string {
    const match = nomeRegra.match(/RC-\d+/);
    return match ? match[0] : '';
  }

  /** Retorna os detalhes de análise de uma regra a partir do seu nome completo */
  obterDetalhesRegra(nomeRegra: string): DetalheRegraInfo | null {
    const id = this.extrairIdRegra(nomeRegra);
    return id ? (detalhesRegra[id] ?? null) : null;
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
      decisaoHumana: null,
      anotacoes: this.anotacoes(),
      timeline: this.timeline,
      relator: 'Dra. Helena Moreira',
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