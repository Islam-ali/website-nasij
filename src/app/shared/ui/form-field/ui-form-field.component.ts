import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="flex flex-col gap-1">
      <label
        *ngIf="label"
        class="text-sm font-medium text-gray-700 dark:text-gray-300"
        [attr.for]="forId"
      >
        {{ label }}
        <span *ngIf="required" class="text-red-500" aria-hidden="true">*</span>
      </label>

      <div>
        <ng-content></ng-content>
      </div>

      <p *ngIf="hint && !error" class="text-xs text-gray-500 dark:text-gray-400">
        {{ hint }}
      </p>
      <p *ngIf="error" class="text-xs text-red-500 dark:text-red-400">
        {{ error }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() required = false;
  @Input('for') forId?: string;
}


