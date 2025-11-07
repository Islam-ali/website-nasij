import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Theme Toggle Button -->
      <button 
        (click)="cycleTheme()" 
        class="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 group"
        [class.dark:bg-dark-surface]="themeService.isDark()"
        [class.dark:hover:bg-dark-surfaceHover]="themeService.isDark()"
        [class.dark:text-dark-text]="themeService.isDark()"
        [title]="themeService.getThemeLabel()">
        
        <i class="pi text-gray-600 transition-all duration-300" 
           [class]="'pi ' + themeService.getThemeIcon()"
           [class.dark:text-dark-text]="themeService.isDark()"></i>
      </button>
      <!-- Theme Mode Indicator -->
      <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white"
           [class.dark:border-dark-surface]="themeService.isDark()"
           [title]="'Current mode: ' + themeService.mode()">
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ThemeToggleComponent {
  isDarkTheme = computed(() => this.themeService.isDark());
  themeService = inject(ThemeService);

  cycleTheme(): void {
    const nextMode = this.themeService.getNextThemeMode();
    this.themeService.setTheme(nextMode);
  }
} 