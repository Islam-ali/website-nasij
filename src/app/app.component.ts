import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BusinessProfileService } from './services/business-profile.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [BusinessProfileService]
})
export class AppComponent implements OnInit {
  title = 'nasig-website';
  isLoading: boolean = true;
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private businessProfileService: BusinessProfileService
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
