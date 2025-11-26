import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [NgClass],
  template: `
    <article
      class="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
      [ngClass]="hoverable ? 'hover:-translate-y-0.5' : ''"
    >
      <div [ngClass]="paddingClass">
        <ng-content></ng-content>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  @Input() padding: CardPadding = 'lg';
  @Input() hoverable = false;

  get paddingClass(): string {
    switch (this.padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      default:
        return 'p-6';
    }
  }
}


