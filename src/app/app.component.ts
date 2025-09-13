import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusinessProfileService } from './services/business-profile.service';
import { TranslationService } from './core/services/translate.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule],
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
  ngOnInit(): void {
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

      // Initialize browser features after app is loaded
      this.translationService.initBrowserFeatures();
    }
  }

  private loadBusinessProfile() {
    this.businessProfileService.getLatestBusinessProfile().subscribe({
      next: (response) => {
        this.businessProfileService.setBusinessProfile(response.data);
        this.init();
      },
      error: (error) => {
        this.isLoading = true;
      }
    });
  }
}
