import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { ParecerService } from '../../services/parecer.service';
import type { Parecer } from '../../models/parecer.model';

@Component({
  selector: 'app-parecer-edicao',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, PanelComponent],
  templateUrl: './parecer-edicao.component.html',
  styleUrl: './parecer-edicao.component.scss',
})
export class ParecerEdicaoComponent implements OnInit {
  private router = inject(Router);
  private parecerService = inject(ParecerService);

  /** Dados do parecer original (somente leitura) */
  readonly parecer = computed(() => this.parecerService.parecerAtivo());

  /** Campos editáveis como signals locais */
  relatoFatos = signal<string[]>([]);
  fundamentacao = signal<string[]>([]);
  conclusao = signal<string>('');
  decisaoHumana = signal<string>('');

  /** Controle de feedback ao salvar */
  salvo = signal(false);

  ngOnInit(): void {
    const p = this.parecerService.parecerAtivo();
    if (!p) {
      // Se não há parecer ativo, volta para a aprovação
      this.router.navigate(['/aprovacao-processo']);
      return;
    }
    // Copia os campos editáveis para signals locais (sem mutar o original)
    this.relatoFatos.set([...p.relatoFatos]);
    this.fundamentacao.set([...p.fundamentacao]);
    this.conclusao.set(p.conclusao);
    this.decisaoHumana.set(p.decisaoHumana ?? '');
  }

  // Relatório (I)

  atualizarRelatoFato(index: number, valor: string): void {
    this.relatoFatos.update((arr) => {
      const copia = [...arr];
      copia[index] = valor;
      return copia;
    });
  }

  adicionarRelatoFato(): void {
    this.relatoFatos.update((arr) => [...arr, '']);
  }

  removerRelatoFato(index: number): void {
    this.relatoFatos.update((arr) => arr.filter((_, i) => i !== index));
  }

  // Fundamentação (II)

  atualizarFundamentacao(index: number, valor: string): void {
    this.fundamentacao.update((arr) => {
      const copia = [...arr];
      copia[index] = valor;
      return copia;
    });
  }

  adicionarFundamentacao(): void {
    this.fundamentacao.update((arr) => [...arr, '']);
  }

  removerFundamentacao(index: number): void {
    this.fundamentacao.update((arr) => arr.filter((_, i) => i !== index));
  }

  // Ações principais

  salvar(): void {
    const original = this.parecerService.parecerAtivo();
    if (!original) return;

    const parecerEditado: Parecer = {
      ...original,
      relatoFatos: this.relatoFatos(),
      fundamentacao: this.fundamentacao(),
      conclusao: this.conclusao(),
      decisaoHumana: this.decisaoHumana().trim() || null,
    };

    this.parecerService.atualizarParecer(parecerEditado);
    this.salvo.set(true);

    // Volta ao modal de pré-visualização após salvar
    setTimeout(() => {
      this.router.navigate(['/aprovacao-processo'], {
        queryParams: { abrirParecer: '1' },
      });
    }, 900);
  }

  cancelar(): void {
    this.router.navigate(['/aprovacao-processo'], {
      queryParams: { abrirParecer: '1' },
    });
  }
}
