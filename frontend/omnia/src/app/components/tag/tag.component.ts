import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagTone = 'neutral' | 'info' | 'accent';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'inline-flex rounded-md px-2 py-0.5 text-xs font-medium ' + toneClass">
      <ng-content></ng-content>
    </span>
  `,
})
export class TagComponent {
  @Input() tone: TagTone = 'neutral';

  get toneClass(): string {
    const map: Record<TagTone, string> = {
      neutral: 'bg-secondary text-secondary-foreground',
      info: 'bg-info-soft text-info',
      accent: 'bg-accent/15 text-accent-foreground',
    };
    return map[this.tone] || map.neutral;
  }
}