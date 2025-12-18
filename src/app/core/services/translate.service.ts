import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly defaultLanguage = 'ar';
  private readonly supportedLanguages = ['ar', 'en'];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Set default language immediately for SSR compatibility
    this.translate.setDefaultLang(this.defaultLanguage);
    
    // Subscribe to language changes to update direction
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe((event) => {
        this.updateDocumentDirection(event.lang);
      });
    }
  }

  private initializeBrowserFeatures(): void {
    // Only run on browser platform
    if (!isPlatformBrowser(this.platformId)) return;

    // Get saved language from localStorage or use browser language
    const savedLanguage = localStorage.getItem('pledge-language');
    // const browserLanguage = this.getBrowserLanguage();

    const languageToUse = savedLanguage || this.defaultLanguage;

    this.setLanguage(languageToUse);
  }

  // private getBrowserLanguage(): string | null {
  //   if (isPlatformBrowser(this.platformId)) {
  //     const browserLang = navigator.language || (navigator as any).userLanguage;
  //     if (browserLang) {
  //       const lang = browserLang.split('-')[0];
  //       return this.supportedLanguages.includes(lang) ? lang : null;
  //     }
  //   }
  //   return null;
  // }

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
      'ar': 'AR',
      'en': 'EN'
    };
    return languageNames[language] || language;
  }

  // Check if translations are loaded for a specific language
  isTranslationReady(lang?: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      // On server, assume translations are ready
      return true;
    }

    const languageToCheck = lang || this.translate.currentLang || this.defaultLanguage;
    const translations = this.translate.translations[languageToCheck];
    
    // Check if translations exist and have content
    return translations && Object.keys(translations).length > 0;
  }

  // Wait for translations to be ready
  waitForTranslations(): Promise<void> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve();
        return;
      }

      const currentLang = this.translate.currentLang || this.defaultLanguage;
      
      // Check if already loaded
      if (this.isTranslationReady(currentLang)) {
        resolve();
        return;
      }

      // Try to get a translation key to trigger loading
      // Use a common key that should exist in all translation files
      const testKey = 'common.loading';
      
      // Wait for translation to load
      const subscription = this.translate.get(testKey).subscribe({
        next: () => {
          // Translation loaded successfully
          subscription.unsubscribe();
          resolve();
        },
        error: () => {
          // Even if there's an error, check if translations are loaded
          subscription.unsubscribe();
          if (this.isTranslationReady(currentLang)) {
            resolve();
          } else {
            // Wait a bit more and resolve anyway
            setTimeout(() => resolve(), 500);
          }
        }
      });

      // Timeout after 5 seconds to prevent infinite waiting
      setTimeout(() => {
        subscription.unsubscribe();
        // Resolve anyway to not block the app
        resolve();
      }, 5000);
    });
  }
}