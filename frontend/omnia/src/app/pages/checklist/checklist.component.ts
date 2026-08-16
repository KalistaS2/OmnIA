import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';  

import {
  biblioteca,
  detalhesRegra,
  RegraBiblioteca,
  DetalheRegraInfo,
} from '../../mock-data/prototype-data';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.scss',
})
export class ChecklistComponent {
  readonly biblioteca: RegraBiblioteca[] = biblioteca;

  regrasPendentes = signal(3);

  gruposDeRegras = signal([
    { id: 'GR-01', nome: 'Pacote Execução Fiscal', regras: 8, descricao: 'Conjunto padrão de verificações recomendadas para varas de execução fiscal.' },
    { id: 'GR-02', nome: 'Pacote Família e Sucessões', regras: 5, descricao: 'Regras essenciais para auditoria em processos de família.' },
    { id: 'GR-03', nome: 'Gabinete Criminal', regras: 12, descricao: 'Verificações de prazos e prescrições criminais.' }
  ]);
  
  // Estado do modal de detalhes (Signal)
  detalheId = signal<string | null>(null);

  // Regra selecionada computada
  regra = computed<RegraBiblioteca | undefined>(() =>
    this.biblioteca.find((r) => r.id === this.detalheId())
  );

  // Detalhes da regra computados
  detalhesInfo = computed<DetalheRegraInfo | undefined>(() => {
    const id = this.detalheId();
    return id ? detalhesRegra[id] : undefined;
  });

  abrirDetalhes(id: string): void {
    this.detalheId.set(id);
  }

  fecharDetalhes(): void {
    this.detalheId.set(null);
  }
}