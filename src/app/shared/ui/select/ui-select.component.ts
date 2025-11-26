import { Component, forwardRef, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiInputDirective } from '../directives/ui-input.directive';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <select
        [id]="inputId()"
        [value]="selectedValue()"
        (change)="onChange($event)"
        (blur)="onTouched()"
        [disabled]="disabled()"
        [uiInput]="size()"
        [class]="'w-full appearance-none bg-white dark:bg-gray-800 pr-8'"
        class="cursor-pointer">
        @if (placeholder()) {
          <option [value]="null" disabled [selected]="!selectedValue()">
            {{ placeholder() }}
          </option>
        }
        @for (option of options(); track option.value) {
          <option 
            [value]="option.value" 
            [disabled]="option.disabled">
            {{ option.label }}
          </option>
        }
      </select>
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  `
})
export class UiSelectComponent implements ControlValueAccessor {
  @Input() options = signal<SelectOption[]>([]);
  @Input() placeholder = signal<string>('');
  @Input() inputId = signal<string>('');
  @Input() size = signal<'sm' | 'md' | 'lg'>('md');
  @Input() disabled = signal<boolean>(false);

  selectedValue = signal<any>(null);
  private onChangeFn?: (value: any) => void;
  private onTouchedFn?: () => void;

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value === 'null' || !target.value ? null : target.value;
    this.selectedValue.set(value);
    if (this.onChangeFn) {
      this.onChangeFn(value);
    }
  }

  onTouched(): void {
    if (this.onTouchedFn) {
      this.onTouchedFn();
    }
  }

  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}


