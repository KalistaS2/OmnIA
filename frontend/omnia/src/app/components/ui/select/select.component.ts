import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, ChevronDown, Check } from 'lucide-angular';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <!-- Trigger (Botão seletor) -->
      <button
        type="button"
        [disabled]="disabled()"
        (click)="toggleOpen()"
        [class]="triggerClass()"
      >
        <span class="truncate">
          {{ selectedLabel() || placeholder }}
        </span>
        <lucide-icon [img]="ChevronDownIcon" class="h-4 w-4 opacity-50 shrink-0"></lucide-icon>
      </button>

      <!-- Dropdown Content -->
      @if (isOpen()) {
        <div
          class="absolute z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
        >
          @for (option of options; track option.value) {
            <div
              (click)="selectOption(option)"
              [class]="
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ' +
                (option.disabled ? 'pointer-events-none opacity-50' : '')
              "
            >
              <span class="truncate">{{ option.label }}</span>
              @if (selectedValue() === option.value) {
                <span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <lucide-icon [img]="CheckIcon" class="h-4 w-4"></lucide-icon>
                </span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly ChevronDownIcon = ChevronDown;
  readonly CheckIcon = Check;

  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Selecione uma opção...';
  @Input() customClass: string = '';

  @Output() valueChange = new EventEmitter<string | number>();

  isOpen = signal<boolean>(false);
  selectedValue = signal<string | number | null>(null);
  disabled = signal<boolean>(false);

  constructor(private elementRef: ElementRef) {}

  selectedLabel = computed(() => {
    const found = this.options.find((opt) => opt.value === this.selectedValue());
    return found ? found.label : null;
  });

  triggerClass = computed(() => {
    const base =
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
    const textColor = this.selectedValue() ? 'text-foreground' : 'text-muted-foreground';
    return `${base} ${textColor} ${this.customClass}`.trim();
  });

  toggleOpen(): void {
    if (this.disabled()) return;
    this.isOpen.update((v) => !v);
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) return;
    this.selectedValue.set(option.value);
    this.isOpen.set(false);
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.selectedValue.set(value ?? null);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}