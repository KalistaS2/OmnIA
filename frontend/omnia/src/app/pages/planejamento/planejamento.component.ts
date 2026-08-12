import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { RiskBadgeComponent } from '../../components/risk-badge/risk-badge.component';
import { TagComponent } from '../../components/tag/tag.component';

import { biblioteca, processos, Processo, RegraBiblioteca } from '../../mock-data/prototype-data';

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
export class PlanejamentoComponent {
  readonly UNIDADES = ['Todas', '1ª Vara Cível', '2ª Vara Cível', 'Vara da Fazenda Pública', '1ª Vara Criminal'];
  readonly SITUACOES = ['Todas', 'Ativo', 'Suspenso', 'Arquivado'];

  // Estados reativos (Signals)
  unidade = signal<string>('1ª Vara Cível');
  situacao = signal<string>('Todas');
  classe = signal<string>('');
  assunto = signal<string>('');
  buscaRegra = signal<string>('');
  regras = signal<string[]>(
    biblioteca.filter((r) => r.selecionada).map((r) => r.id)
  );

  // Lista de processos filtrada dinamicamente
  lista = computed<Processo[]>(() => {
    const u = this.unidade();
    const s = this.situacao();
    const c = this.classe().toLowerCase();
    const a = this.assunto().toLowerCase();

    return processos.filter(
      (p) =>
        (u === 'Todas' || p.unidade === u) &&
        (s === 'Todas' || p.situacao === s) &&
        p.classe.toLowerCase().includes(c) &&
        p.assunto.toLowerCase().includes(a)
    );
  });

  // Lista de regras da biblioteca filtrada pela busca
  regrasFiltradas = computed<RegraBiblioteca[]>(() => {
    const b = this.buscaRegra().toLowerCase();
    return biblioteca.filter((r) => r.nome.toLowerCase().includes(b));
  });

  toggleRegra(id: string): void {
    this.regras.update((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }
}