import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly defaultLanguage = 'en';
  private readonly supportedLanguages = ['en', 'ar'];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // // Set default language immediately for SSR compatibility
    // this.translate.setDefaultLang(this.defaultLanguage);
    // this.translate.use(this.defaultLanguage); // Ensure a language is set for SSR
  }

  private initializeBrowserFeatures(): void {
    // Only run on browser platform
    if (!isPlatformBrowser(this.platformId)) return;

    // Get saved language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('pledge-language');
    const browserLanguage = this.getBrowserLanguage();
    const languageToUse = savedLanguage || browserLanguage || this.defaultLanguage;

    this.setLanguage(languageToUse);
  }

  private getBrowserLanguage(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = navigator.language || (navigator as any).userLanguage;
      if (browserLang) {
        const lang = browserLang.split('-')[0];
        return this.supportedLanguages.includes(lang) ? lang : null;
      }
    }
    return null;
  }

  setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      this.translate.use(language);

      // Only access localStorage on browser platform
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('pledge-language', language);
        this.updateDocumentDirection(language);
      }
    }
  }

  // Public method to initialize browser features when needed
  initBrowserFeatures(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeBrowserFeatures();
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLanguage;
  }

  getSupportedLanguages(): string[] {
    return [...this.supportedLanguages];
  }

  isRTL(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  private updateDocumentDirection(language: string): void {
    // Only update DOM on browser platform
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      const body = document.body;

      if (language === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
        html.classList.add('rtl');
        html.classList.remove('ltr');
        body.classList.add('rtl');
        body.classList.remove('ltr');
      } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', 'en');
        html.classList.add('ltr');
        html.classList.remove('rtl');
        body.classList.add('ltr');
        body.classList.remove('rtl');
      }
    }
  }

  // Get language display name
  getLanguageDisplayName(language: string): string {
    const languageNames: { [key: string]: string } = {
      'en': 'EN',
      'ar': 'AR'
    };
    return languageNames[language] || language;
  }
}