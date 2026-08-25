import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TagTone = 'neutral' | 'info' | 'accent';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
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