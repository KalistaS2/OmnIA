import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RiskLevel = 'Alta' | 'Média' | 'Baixa';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ' + badgeClass">
      {{ level }}
    </span>
  `,
})
export class RiskBadgeComponent {
  @Input({ required: true }) level!: RiskLevel;

  get badgeClass(): string {
    const map: Record<RiskLevel, string> = {
      Alta: 'bg-risk-high-soft text-risk-high',
      Média: 'bg-risk-medium-soft text-risk-medium',
      Baixa: 'bg-risk-low-soft text-risk-low',
    };
    return map[this.level] || '';
  }
}