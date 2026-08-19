import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import type { Parecer } from '../../models/parecer.model';
import {
  LucideAngularModule,
  X,
  Printer,
  FileSignature,
  Upload,
  Pencil,
} from 'lucide-angular';
import { ParecerDocumentoComponent } from '../parecer-documento/parecer-documento.component';
import { ParecerService } from '../../services/parecer.service';

@Component({
  selector: 'app-parecer-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ParecerDocumentoComponent],
  templateUrl: './parecer-modal.component.html',
})
export class ParecerModalComponent {
  @Input() parecer!: Parecer;
  @Input() aberto = false;
  @Output() fechar = new EventEmitter<void>();

  private parecerService = inject(ParecerService);
  private router = inject(Router);

  readonly XIcon = X;
  readonly PrinterIcon = Printer;
  readonly FileSignatureIcon = FileSignature;
  readonly UploadIcon = Upload;
  readonly PencilIcon = Pencil;

  /** Feedback visual temporário após envio ao Projudi */
  projudiEnviado = signal(false);
  projudiEnviando = signal(false);

  onFechar(): void {
    this.fechar.emit();
  }

  onImprimir(): void {
    this.parecerService.imprimirParecer();
  }

  onEditar(): void {
    this.onFechar();
    this.router.navigate(['/parecer-edicao']);
  }

  /**
   * Envia o parecer ao Projudi.
   * TODO: substituir o simulador pela chamada real à API do Projudi
   * quando a integração estiver disponível.
   */
  onAdicionarProjudi(): void {
    if (this.projudiEnviando()) return;
    this.projudiEnviando.set(true);
    // Simulação — remover quando a API real estiver disponível
    setTimeout(() => {
      this.projudiEnviando.set(false);
      this.projudiEnviado.set(true);
      setTimeout(() => this.projudiEnviado.set(false), 4000);
    }, 1400);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('parecer-modal-backdrop')) {
      this.onFechar();
    }
  }
}
