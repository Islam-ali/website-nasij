import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';

interface LanguageOption {
  label: string;
  value: string;
  flag?: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-switcher flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      @for (option of languageOptions; track option.value) {
        <button
          type="button"
          (click)="onLanguageChange(option.value)"
          [class.active]="selectedLanguage === option.value"
          class="language-button px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                 text-gray-600 dark:text-gray-400
                 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50
                 active:text-primary-600 dark:active:text-primary-400 active:bg-primary-50 dark:active:bg-primary-900/30
                 [&.active]:text-primary-600 [&.active]:dark:text-primary-400 
                 [&.active]:bg-white [&.active]:dark:bg-gray-700
                 [&.active]:shadow-sm"
          [attr.aria-label]="'Switch to ' + option.label"
          [attr.aria-pressed]="selectedLanguage === option.value">
          @if (option.flag) {
            <span class="text-base">{{ option.flag }}</span>
          }
          <span>{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    
    .language-switcher {
      min-width: fit-content;
    }
    
    .language-button {
      white-space: nowrap;
    }
    
    .language-button:focus-visible {
      outline: 2px solid var(--primary-500);
      outline-offset: 2px;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  selectedLanguage: string = 'en';
  languageOptions: LanguageOption[] = [];

  constructor(
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.translationService.initBrowserFeatures();
      setTimeout(() => {
        this.selectedLanguage = this.translationService.getCurrentLanguage();
        this.initializeLanguageOptions();
      }, 200);
    }
  }

  private initializeLanguageOptions(): void {
    const supportedLanguages = this.translationService.getSupportedLanguages();
    const flagMap: { [key: string]: string } = {
      'en': '🇬🇧',
      'ar': '🇸🇦',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'de': '🇩🇪'
    };
    
    this.languageOptions = supportedLanguages.map(lang => ({
      label: this.translationService.getLanguageDisplayName(lang),
      value: lang,
      flag: flagMap[lang] || '🌐'
    }));
  }

  onLanguageChange(value: string): void {
    if (value) {
      this.selectedLanguage = value;
      this.translationService.setLanguage(value);
    }
  }

  getCurrentLanguageDisplay(): string {
    return this.translationService.getLanguageDisplayName(this.selectedLanguage);
  }
}