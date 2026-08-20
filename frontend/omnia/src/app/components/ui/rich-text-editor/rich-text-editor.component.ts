import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor, OnChanges {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;

  @Input() value = '';
  @Input() placeholder = '';
  @Input() minHeight = '80px';
  @Input() showToolbar = true;
  @Output() valueChange = new EventEmitter<string>();



  // ControlValueAccessor callbacks
  onChange = (value: string) => {};
  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      if (this.editorRef && this.editorRef.nativeElement.innerHTML !== this.value) {
        this.editorRef.nativeElement.innerHTML = this.value || '';
      }
    }
  }

  ngOnInit(): void {
    if (this.editorRef && this.value) {
      this.editorRef.nativeElement.innerHTML = this.value;
    }
  }

  writeValue(value: string): void {
    this.value = value || '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }

  onInput(): void {
    if (!this.editorRef) return;
    const html = this.editorRef.nativeElement.innerHTML;
    this.value = html;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  execCommand(command: string, value: string | undefined = undefined): void {
    document.execCommand(command, false, value);
    this.editorRef.nativeElement.focus();
    this.onInput();
  }
}
