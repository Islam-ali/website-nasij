import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'danger' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type"
      class="inline-flex items-center justify-center gap-2 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 transition-colors duration-200"
      [ngClass]="computedClasses"
      [disabled]="disabled || loading"
    >
      @if (loading) {
      <span class="inline-flex">
        <svg
          class="size-4 animate-spin text-current"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </span>
      }
      <span class="inline-flex items-center" [class.sr-only]="iconOnly">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiButtonComponent {
  private static readonly VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: 'w-full py-4 bg-gradient-to-r from-primary-400 to-primary-800 dark:from-primary-500 dark:to-primary-900 text-white rounded-2xl font-semibold hover:from-primary-700 hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-600 transition-all duration-300 mt-8 disabled:opacity-50 disabled:cursor-not-allowed  transform hover:scale-105',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
    outline:
      'border border-gray-300 text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800',
    ghost:
      'text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300 dark:text-gray-100 dark:hover:bg-gray-800',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    warning: 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500 dark:bg-orange-600 dark:hover:bg-orange-700',
    link: 'text-violet-600 hover:text-violet-700 underline-offset-4 hover:underline',
  };

  private static readonly SIZE_CLASSES: Record<ButtonSize, string> = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() block = false;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() iconOnly = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get computedClasses(): string[] {
    const classes = [
      UiButtonComponent.VARIANT_CLASSES[this.variant],
      UiButtonComponent.SIZE_CLASSES[this.size],
    ];

    if (this.block) {
      classes.push('w-full');
    }

    if (this.iconOnly) {
      classes.push('aspect-square p-2');
    }

    if (this.variant !== 'link') {
      classes.push('focus-visible:ring-offset-background');
    }

    return classes;
  }
}

