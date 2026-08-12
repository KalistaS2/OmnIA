import { Component, Input, Output, EventEmitter, forwardRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent implements ControlValueAccessor {
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