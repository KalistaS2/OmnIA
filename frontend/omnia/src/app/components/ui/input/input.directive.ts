import { Directive, Input, computed, signal } from '@angular/core';

@Directive({
  selector: 'input[appInput], input[app-input], textarea[appInput], textarea[app-input]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class InputDirective {
  private _class = signal<string>('');

  @Input()
  set class(value: string) {
    this._class.set(value || '');
  }

  computedClass = computed(() => {
    const base =
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
    return `${base} ${this._class()}`.trim();
  });
}