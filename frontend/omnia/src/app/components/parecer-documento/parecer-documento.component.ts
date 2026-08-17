import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Parecer } from '../../models/parecer.model';

@Component({
  selector: 'app-parecer-documento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parecer-documento.component.html',
})
export class ParecerDocumentoComponent {
  @Input() parecer!: Parecer;

  getVereditoClass(v: string): string {
    const map: Record<string, string> = {
      'Atende': 'parecer-veredito--atende',
      'Não atende': 'parecer-veredito--nao-atende',
      'Não se encaixa': 'parecer-veredito--neutro',
    };
    return map[v] ?? '';
  }

  get naoAtendeCount(): number {
    return this.parecer.analiseRegras.filter(r => r.veredito === 'Não atende').length;
  }
}
