import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'button[app-button], a[app-button], app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    '[class]': 'computedClass()',
    '[attr.disabled]': 'disabled ? "" : null',
    '[attr.aria-disabled]': 'disabled',
    '[attr.type]': 'type',
  },
})
export class ButtonComponent {
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  private _variant = signal<ButtonVariant>('default');
  private _size = signal<ButtonSize>('default');
  private _class = signal<string>('');

  @Input()
  set variant(value: ButtonVariant) {
    this._variant.set(value || 'default');
  }

  @Input()
  set size(value: ButtonSize) {
    this._size.set(value || 'default');
  }

  @Input()
  set class(value: string) {
    this._class.set(value || '');
  }

  readonly variantStyles: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  readonly sizeStyles: Record<ButtonSize, string> = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9',
  };

  computedClass = computed(() => {
    const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';
    return `${base} ${this.variantStyles[this._variant()]} ${this.sizeStyles[this._size()]} ${this._class()}`.trim();
  });
}