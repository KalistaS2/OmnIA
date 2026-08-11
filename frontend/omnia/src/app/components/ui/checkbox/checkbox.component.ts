import { Component, Input, Output, EventEmitter, forwardRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      role="checkbox"
      [attr.aria-checked]="checked()"
      [disabled]="disabled()"
      (click)="toggle()"
      [class]="computedClass()"
    >
      @if (checked()) {
        <lucide-icon [img]="CheckIcon" class="h-3.5 w-3.5 stroke-[3] text-current"></lucide-icon>
      }
    </button>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly CheckIcon = Check;

  checked = signal<boolean>(false);
  disabled = signal<boolean>(false);
  private _class = signal<string>('');

  @Input()
  set class(value: string) {
    this._class.set(value || '');
  }

  @Input()
  set isChecked(val: boolean) {
    this.checked.set(val);
  }

  @Output() checkedChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  computedClass = computed(() => {
    const base =
      'grid place-content-center h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    const stateStyle = this.checked()
      ? 'bg-primary text-primary-foreground'
      : 'bg-transparent text-transparent';
    return `${base} ${stateStyle} ${this._class()}`.trim();
  });

  toggle(): void {
    if (this.disabled()) return;
    const nextState = !this.checked();
    this.checked.set(nextState);
    this.onChange(nextState);
    this.onTouched();
    this.checkedChange.emit(nextState);
  }

  // Métodos da interface ControlValueAccessor
  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}