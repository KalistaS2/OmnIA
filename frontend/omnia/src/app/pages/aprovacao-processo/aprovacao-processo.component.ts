import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ArrowLeft,
  CheckCircle2,
  FileText,
  FileSignature,
  NotebookPen,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-angular';

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
    FormsModule,
    LucideAngularModule,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './aprovacao-processo.component.html',
})
export class AprovacaoProcessoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  processo = signal<string>('0801234-00.2026.8.23.0001');
  readonly linhas: ItemVeredito[] = correicaoPorProcesso['padrao'] ?? [];

  readonly timeline = [
    { data: '8/7/2026', texto: 'Decisão determinou a expedição de ofício', tone: 'bg-info-soft' },
    {
      data: '9 a 13/7/2026',
      texto: 'Cumprimento não localizado nos movimentos e documentos',
      tone: 'bg-risk-medium-soft',
    },
    { data: '14/7/2026', texto: 'Arquivamento definitivo', tone: 'bg-risk-high-soft' },
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
    { label: 'Aprovar correição', icon: CheckCircle2 },
    { label: 'Descartar achado', icon: XCircle },
    { label: 'Solicitar revisão', icon: RotateCcw },
    { label: 'Encaminhar à unidade', icon: Send },
  ];

  // Estados reativos (Signals)
  decisao = signal<string | null>(null);
  anotacao = signal<string>('');
  anotacoes = signal<string[]>([]);
  relatorio = signal<string | null>(null);

  // Ícones
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly FileTextIcon = FileText;
  readonly FileSignatureIcon = FileSignature;
  readonly NotebookPenIcon = NotebookPen;

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
    this.anotacoes.update((a) => [...a, texto]);
    this.anotacao.set('');
  }

  gerarRelatorio(): void {
    const naoAtende = this.linhas.filter((l) => l.veredito === 'Não atende');
    const relatorioTexto = [
      `Relatório correicional — Processo ${this.processo()}`,
      `Decisão da equipe: ${this.decisao() ?? 'pendente de registro'}.`,
      '',
      'Achados da correição automatizada:',
      ...this.linhas.map((l) => `· ${l.regra} — ${l.veredito}: ${l.trecho}`),
      '',
      `Regras não atendidas: ${naoAtende.length}.`,
      '',
      this.anotacoes().length ? 'Anotações da equipe:' : 'Sem anotações registradas.',
      ...this.anotacoes().map((a, i) => `${i + 1}. ${a}`),
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