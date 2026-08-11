import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="computedClass()">
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  private _variant = signal<BadgeVariant>('default');
  private _class = signal<string>('');

  @Input() 
  set variant(value: BadgeVariant) {
    this._variant.set(value);
  }

  @Input() 
  set class(value: string) {
    this._class.set(value || '');
  }

  readonly variantStyles: Record<BadgeVariant, string> = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
    outline: 'text-foreground',
  };

  computedClass = computed(() => {
    const base = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantStyle = this.variantStyles[this._variant()];
    return `${base} ${variantStyle} ${this._class()}`.trim();
  });
}