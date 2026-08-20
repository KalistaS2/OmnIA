import { Component, Input, inject, signal, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { REFERENCE_PERIOD } from '../../mock-data/prototype-data';
import { NotificationService } from '../../services/notification.service';
import { Notificacao } from '../../models/notificacao.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  host: {
    class: 'block min-h-screen',
    '[attr.title]': 'null',
  },
})
export class AppShellComponent implements OnInit {
  private readonly el = inject(ElementRef);

  @Input() title: string = '';
  @Input() subtitle?: string;

  ngOnInit(): void {
    this.el.nativeElement.removeAttribute('title');
  }

  readonly notifService = inject(NotificationService);
  readonly notificacoesAbertas = signal<boolean>(false);

  readonly referencePeriod = REFERENCE_PERIOD;

  readonly nav = [
    { to: '/', label: 'Dashboard correicional', step: '01', icon: 'dashboard' },
    { to: '/planejamento', label: 'Planejamento', step: '02', icon: 'assignment' },
    { to: '/checklist', label: 'Regras de correição', step: '03', icon: 'rule' },
    { to: '/acompanhamento', label: 'Acompanhamento', step: '04', icon: 'monitoring' },
    { to: '/aprovacao', label: 'Aprovação e execução', step: '05', icon: 'verified_user' },
    { to: '/resultados', label: 'Resultados e riscos', step: '06', icon: 'bar_chart' },
  ];

  toggleNotificacoes(): void {
    this.notificacoesAbertas.update((v) => !v);
  }

  fecharNotificacoes(): void {
    this.notificacoesAbertas.set(false);
  }

  aoClicarNotificacao(notif: Notificacao): void {
    this.notifService.marcarComoLida(notif.id);
    this.fecharNotificacoes();
  }
}