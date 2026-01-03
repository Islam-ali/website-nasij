import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusinessProfileService } from './services/business-profile.service';
import { TranslationService } from './core/services/translate.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  providers: [BusinessProfileService]
})
export class AppComponent implements OnInit {
  title = 'pledge-website';
  isLoading: boolean = true;
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private businessProfileService: BusinessProfileService,
    private translationService: TranslationService
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
    this.businessProfileService.getLatestBusinessProfile().subscribe({
      next: (response) => {
        this.businessProfileService.setBusinessProfile(response.data);
        this.init();
      },
      error: (error) => {
        // Don't block rendering on error, especially during SSR
        if (isPlatformBrowser(this.platformId)) {
          this.isLoading = true;
        } else {
          // During SSR, allow rendering even if business profile fails
          this.isLoading = false;
        }
      }
    });
  }
}
