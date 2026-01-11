import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusinessProfileService } from './services/business-profile.service';
import { TranslationService } from './core/services/translate.service';
import { ThemeService } from './services/theme.service';
import { SeoService } from './core/services/seo.service';
import { take } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  providers: [BusinessProfileService]
})
export class AppComponent implements OnInit {
  title = 'store-website';
  isLoading: boolean = true;
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private businessProfileService: BusinessProfileService,
    private translationService: TranslationService,
    private themeService: ThemeService,
    private seoService: SeoService
  ) { }
  async ngOnInit(): Promise<void> {
    // Initialize language and direction immediately
    if (isPlatformBrowser(this.platformId)) {
      this.translationService.initBrowserFeatures();
    }
    
    // During SSR, don't block rendering
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      this.loadBusinessProfile();
      return;
    }
    
    // Wait for translations to be ready before showing the app
    await this.translationService.waitForTranslations();
    
    // After translations are ready, load business profile
    this.loadBusinessProfile();
  }

  init() {
    // use document for ssr
    if (isPlatformBrowser(this.platformId)) {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
        this.renderer.setStyle(loadingOverlay, 'display', 'none');
        this.renderer.setStyle(document.body, 'overflow', 'auto');
        this.isLoading = false;
      }
    }
  }

  private loadBusinessProfile() {
    // Business profile is now loaded via resolver, just initialize the app
    // Use take(1) to prevent infinite loop - only subscribe once
    this.businessProfileService.getBusinessProfile$().pipe(
      take(1)
    ).subscribe({
      next: (profile) => {
        if (profile) {
          // Don't call setBusinessProfile here - it's already set by resolver
          // This would cause infinite loop since setBusinessProfile triggers the observable
          // Profile already loaded by resolver, just ensure SEO is applied
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
              this.seoService.applyBusinessProfileSeo(profile);
            }, 100);
          }
        }
        this.init();
      },
      error: (error) => {
        console.error('Error loading business profile:', error);
        // Don't block rendering on error, especially during SSR
        if (isPlatformBrowser(this.platformId)) {
          this.isLoading = true;
        } else {
          // During SSR, allow rendering even if business profile fails
          this.isLoading = false;
        }
        this.init();
      }
    });
  }
}
