import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class]="chipClasses()"
      class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300">
      <ng-content></ng-content>
      @if (removable) {
        <button
          type="button"
          (click)="onRemove($event)"
          [class]="removeButtonClasses()"
          class="ml-1 -mr-1 flex-shrink-0 rounded-full p-0.5 transition-colors duration-200"
          [attr.aria-label]="'Remove'">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      }
    </div>
  `
})
export class UiChipComponent {
  @Input() variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  @Input() removable: boolean = false;
  @Output() remove = new EventEmitter<void>();

  chipClasses = signal<string>('');
  removeButtonClasses = signal<string>('');

  ngOnInit(): void {
    const variantClasses = {
      default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border border-primary-200 dark:border-primary-800',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
      danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
    };

    const removeButtonClasses = {
      default: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
      primary: 'text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200',
      success: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200',
      warning: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200',
      danger: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
    };

    this.chipClasses.set(variantClasses[this.variant] || variantClasses.default);
    this.removeButtonClasses.set(removeButtonClasses[this.variant] || removeButtonClasses.default);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }
}

