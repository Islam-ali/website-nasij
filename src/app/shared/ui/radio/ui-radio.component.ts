import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-radio',
  standalone: true,
  imports: [NgClass],
  template: `
    <label
      class="group flex cursor-pointer items-start gap-3"
      [ngClass]="{ 'opacity-60 pointer-events-none': disabled }"
    >
      <span class="relative flex h-6 w-6 items-center justify-center">
        <input
          type="radio"
          class="peer sr-only"
          [checked]="checked"
          [disabled]="disabled"
          (change)="select($event)"
        />
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white transition duration-200 dark:border-gray-600 dark:bg-gray-900 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500"
          [ngClass]="{
            'border-violet-600 dark:border-violet-400': checked
          }"
        >
          @if (checked) {
          <span
            class="h-2.5 w-2.5 rounded-full bg-violet-600 dark:bg-violet-400"
          ></span>
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
      useExisting: forwardRef(() => UiRadioComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiRadioComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description?: string;
  @Input() value: string | number | boolean | null = null;

  checked = false;
  disabled = false;

  private onChange: (value: typeof this.value) => void = () => {};
  private onTouched: () => void = () => {};

  select(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.checked = true;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: typeof this.value): void {
    this.checked = value === this.value;
  }

  registerOnChange(fn: (value: typeof this.value) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}


