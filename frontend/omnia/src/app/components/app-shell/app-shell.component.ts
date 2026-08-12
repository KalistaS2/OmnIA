import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { REFERENCE_PERIOD } from '../../mock-data/prototype-data';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;

  readonly referencePeriod = REFERENCE_PERIOD;

  readonly nav = [
    { to: '/', label: 'Dashboard correicional', step: '01', icon: 'dashboard' },
    { to: '/planejamento', label: 'Planejamento', step: '02', icon: 'assignment' },
    { to: '/checklist', label: 'Regras de correição', step: '03', icon: 'rule' },
    { to: '/aprovacao', label: 'Aprovação e execução', step: '04', icon: 'verified_user' },
    { to: '/resultados', label: 'Resultados e riscos', step: '05', icon: 'bar_chart' },
  ];
}