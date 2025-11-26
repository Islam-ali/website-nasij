import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-divider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <hr 
      [class]="dividerClasses()"
      class="border-t transition-colors duration-300">
  `
})
export class UiDividerComponent {
  @Input() variant = signal<'default' | 'dashed' | 'dotted'>('default');

  dividerClasses = signal<string>('');

  ngOnInit(): void {
    const variantClasses = {
      default: 'border-gray-200 dark:border-gray-700',
      dashed: 'border-dashed border-gray-200 dark:border-gray-700',
      dotted: 'border-dotted border-gray-200 dark:border-gray-700'
    };

    this.dividerClasses.set(variantClasses[this.variant()] || variantClasses.default);
  }
}


