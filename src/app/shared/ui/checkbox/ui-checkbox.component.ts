import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [NgClass],
  template: `
    <label
      class="group flex cursor-pointer items-start gap-3"
      [ngClass]="{ 'opacity-60 pointer-events-none': disabled }"
    >
      <span class="relative flex h-6 w-6 items-center justify-center">
        <input
          type="checkbox"
          class="peer sr-only"
          [checked]="value"
          [disabled]="disabled"
          (change)="toggle($event)"
        />
        <span
          class="flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white transition duration-200 dark:border-gray-600 dark:bg-gray-900 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500"
          [ngClass]="{
            'bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:border-violet-400':
              value
          }"
        >
          @if (value) {
          <svg
            class="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M6 10.5l2.5 2.5L14 8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          }
        </span>
      </span>
      <span class="space-y-1 leading-tight">
        <span class="block text-sm font-medium text-gray-900 dark:text-white">
          {{ label }}
        </span>
        @if (description) {
        <span class="block text-sm text-gray-500 dark:text-gray-400">
          {{ description }}
        </span>
        }
      </span>
    </label>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description?: string;

  value = false;
  disabled = false;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.value = !!value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}


