import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  ShieldCheck,
  BarChart3,
  Bell,
  Search,
} from 'lucide-angular';
import { REFERENCE_PERIOD } from '../../mock-data/prototype-data';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;

  readonly referencePeriod = REFERENCE_PERIOD;

  // Ícones do Lucide registrados para uso no template
  readonly SearchIcon = Search;
  readonly BellIcon = Bell;

  readonly nav = [
    { to: '/', label: 'Dashboard correicional', step: '01', icon: LayoutDashboard },
    { to: '/planejamento', label: 'Planejamento', step: '02', icon: ClipboardList },
    { to: '/checklist', label: 'Regras de correição', step: '03', icon: ListChecks },
    { to: '/aprovacao', label: 'Aprovação e execução', step: '04', icon: ShieldCheck },
    { to: '/resultados', label: 'Resultados e riscos', step: '05', icon: BarChart3 },
  ];
}