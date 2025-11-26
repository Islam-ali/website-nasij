import { Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UiInputDirective } from '../directives/ui-input.directive';

@Component({
  selector: 'ui-password',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInputDirective],
  template: `
    <div class="relative">
      <input
        [id]="inputId"
        [type]="showPassword() ? 'text' : 'password'"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [disabled]="disabled"
        [placeholder]="placeholder"
        [uiInput]="size"
        [invalid]="invalid"
        class="pr-10"
      />
      @if (toggleMask) {
        <button
          type="button"
          (click)="togglePassword()"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          tabindex="-1"
        >
          <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
        </button>
      }
    </div>
    @if (feedback && value) {
      <div class="mt-2 space-y-1">
        <div class="flex items-center gap-2 text-xs" [class.text-green-600]="hasLowercase" [class.text-gray-400]="!hasLowercase">
          <i [class]="hasLowercase ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          Lowercase letter
        </div>
        <div class="flex items-center gap-2 text-xs" [class.text-green-600]="hasUppercase" [class.text-gray-400]="!hasUppercase">
          <i [class]="hasUppercase ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          Uppercase letter
        </div>
        <div class="flex items-center gap-2 text-xs" [class.text-green-600]="hasNumber" [class.text-gray-400]="!hasNumber">
          <i [class]="hasNumber ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          Number
        </div>
        <div class="flex items-center gap-2 text-xs" [class.text-green-600]="hasSpecialChar" [class.text-gray-400]="!hasSpecialChar">
          <i [class]="hasSpecialChar ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          Special character
        </div>
        <div class="flex items-center gap-2 text-xs" [class.text-green-600]="hasMinLength" [class.text-gray-400]="!hasMinLength">
          <i [class]="hasMinLength ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
          At least 8 characters
        </div>
      </div>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiPasswordComponent),
      multi: true,
    },
  ],
})
export class UiPasswordComponent implements ControlValueAccessor {
  @Input() inputId?: string;
  @Input() placeholder = '';
  @Input() toggleMask = true;
  @Input() feedback = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() invalid = false;

  showPassword = signal(false);
  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.value);
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.value);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.value);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.value);
  }

  get hasMinLength(): boolean {
    return this.value.length >= 8;
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}


