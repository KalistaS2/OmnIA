import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section [class]="'panel p-5 ' + customClass">
      @if (title) {
        <header class="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 class="text-lg text-foreground">{{ title }}</h2>
            @if (description) {
              <p class="mt-0.5 text-sm text-muted-foreground">{{ description }}</p>
            }
          </div>
          <ng-content select="[right]"></ng-content>
        </header>
      }
      <ng-content></ng-content>
    </section>
  `,
})
export class PanelComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() customClass: string = '';
}