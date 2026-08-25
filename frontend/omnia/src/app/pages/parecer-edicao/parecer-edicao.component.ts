import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { RichTextEditorComponent } from '../../components/ui/rich-text-editor/rich-text-editor.component';
import { ParecerService } from '../../services/parecer.service';
import type { Parecer } from '../../models/parecer.model';

@Component({
  selector: 'app-parecer-edicao',
  standalone: true,
  imports: [CommonModule, FormsModule, AppShellComponent, PanelComponent, RichTextEditorComponent],
  templateUrl: './parecer-edicao.component.html',
  styleUrl: './parecer-edicao.component.scss',
})
export class ParecerEdicaoComponent implements OnInit {
  private router = inject(Router);
  private parecerService = inject(ParecerService);

  /** Dados do parecer original (somente leitura) */
  readonly parecer = computed(() => this.parecerService.parecerAtivo());

  /** Campos editáveis como signals locais */
  relatoFatosHtml = signal<string>('');
  fundamentacaoHtml = signal<string>('');
  conclusao = signal<string>('');
  decisaoHumana = signal<string>('');

  /** Controle de feedback ao salvar */
  salvo = signal(false);

  /** Controle de estado dos botões da toolbar */
  activeCommands = signal<Record<string, boolean>>({});

  execGlobalCommand(command: string, value: string | undefined = undefined): void {
    document.execCommand(command, false, value);
    this.checkActiveCommands();
  }

  @HostListener('document:selectionchange')
  onSelectionChange() {
    this.checkActiveCommands();
  }

  checkActiveCommands() {
    const commands = [
      'bold', 'italic', 'underline', 'strikethrough', 
      'subscript', 'superscript', 'justifyLeft', 
      'justifyCenter', 'justifyRight', 'justifyFull', 
      'insertUnorderedList', 'insertOrderedList'
    ];
    
    const active: Record<string, boolean> = {};
    for (const cmd of commands) {
      active[cmd] = document.queryCommandState(cmd);
    }
    
    this.activeCommands.set(active);
  }

  ngOnInit(): void {
    const p = this.parecerService.parecerAtivo();
    if (!p) {
      // Se não há parecer ativo, volta para a aprovação
      this.router.navigate(['/aprovacao-processo']);
      return;
    }
    // Une os parágrafos em blocos HTML
    this.relatoFatosHtml.set(p.relatoFatos.map(paragrafo => `<p>${paragrafo}</p>`).join(''));
    this.fundamentacaoHtml.set(p.fundamentacao.map(paragrafo => `<p>${paragrafo}</p>`).join(''));
    this.conclusao.set(p.conclusao);
    this.decisaoHumana.set(p.decisaoHumana ?? '');
  }

  // Funções de atualização simples

  atualizarRelatoHtml(valor: string): void {
    this.relatoFatosHtml.set(valor);
  }

  atualizarFundamentacaoHtml(valor: string): void {
    this.fundamentacaoHtml.set(valor);
  }

  // Ações principais

  salvar(): void {
    const original = this.parecerService.parecerAtivo();
    if (!original) return;

    const parecerEditado: Parecer = {
      ...original,
      // Salva o bloco inteiro no primeiro índice do array, ou poderíamos separar por <p>
      // Por simplicidade para manter compatibilidade com o modelo, enviamos num único item
      relatoFatos: [this.relatoFatosHtml()],
      fundamentacao: [this.fundamentacaoHtml()],
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
