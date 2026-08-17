import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppShellComponent } from '../../components/app-shell/app-shell.component';
import { PanelComponent } from '../../components/panel/panel.component';
import { TagComponent } from '../../components/tag/tag.component';

export interface Msg {
  autor: 'user' | 'ia';
  texto: string;
}

const PASSOS_SUGERIDOS = [
  'Selecionar processos com arquivamento definitivo no período de referência.',
  'Localizar decisão ou despacho anterior determinando a expedição de ofício.',
  'Verificar movimentos posteriores de expedição ou cumprimento.',
  'Verificar documentos e certidões que comprovem o cumprimento.',
  'Excluir casos com decisão posterior dispensando a expedição.',
  'Sinalizar processos sem qualquer registro de cumprimento.',
];

@Component({
  selector: 'app-criar-regra',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    AppShellComponent,
    PanelComponent,
    TagComponent,
  ],
  templateUrl: './criar-regra.component.html',
  styleUrl: './criar-regra.component.scss',
})
export class CriarRegraComponent {
  // Estados reativos (Signals)
  instrucao = signal<string>(
    'Verifique se existem processos arquivados definitivamente nos quais tenha sido determinada a expedição de ofício, mas não exista registro posterior de expedição ou cumprimento.'
  );
  atende = signal<string>('Há certidão ou documento comprovando a expedição do ofício.');
  naoAtende = signal<string>('Arquivamento definitivo sem qualquer registro posterior de cumprimento.');
  naoEncaixa = signal<string>('Processos sem determinação de expedição de ofício.');

  mensagens = signal<Msg[]>([
    {
      autor: 'ia',
      texto:
        'Descreva a verificação desejada e informe os cenários de atendimento, de não atendimento e de não enquadramento. Vou transformar tudo em uma sequência de passos auditáveis.',
    },
  ]);

  passos = signal<string[] | null>(null);
  aprovado = signal<boolean>(false);
  nome = signal<string>('Arquivamento com possível pendência');
  descricao = signal<string>(
    'Sinaliza arquivamentos definitivos sem registro posterior de cumprimento de determinação judicial.'
  );
  salva = signal<boolean>(false);

  enviar(): void {
    const textoUsuario = `${this.instrucao()}\n\nAtende: ${this.atende()}\nNão atende: ${this.naoAtende()}\nNão se encaixa: ${this.naoEncaixa()}`;

    this.mensagens.update((m) => [
      ...m,
      {
        autor: 'user',
        texto: textoUsuario,
      },
      {
        autor: 'ia',
        texto: 'Traduzi a instrução na sequência de passos abaixo. Revise antes de aprovar.',
      },
    ]);

    this.passos.set(PASSOS_SUGERIDOS);
  }

  aprovarPassos(): void {
    this.aprovado.set(true);
  }

  salvarRegra(): void {
    this.salva.set(true);
  }
}