import { Component, Inject, PLATFORM_ID, OnInit, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusinessProfileService } from '../../services/business-profile.service';
import { IBusinessProfile } from '../../interfaces/business-profile.interface';
import { ThemeService } from '../../core/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MultiLanguagePipe],
  template: `
  <!-- Enhanced Footer -->
  <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" role="contentinfo" aria-label="معلومات الموقع والتواصل">
    <!-- Main Footer Content -->
    <div class="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
        
        <!-- Company Info -->
        <div class="space-y-4 sm:space-y-6 col-span-1 sm:col-span-2">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg border bg-white dark:bg-gray-800 border-primary-200 flex items-center justify-center flex-shrink-0">
              @if(isDarkTheme()) {
                <img [src]="getImageUrl(businessProfile?.logo_dark?.filePath || '')" alt="pledge Logo" class="w-full h-full object-contain p-1 sm:p-2">
              } @else {
              <img [src]="getImageUrl(businessProfile?.logo_light?.filePath || '')" alt="pledge Logo" class="w-full h-full object-contain p-1 sm:p-2">
              }
            </div>  
            <span class="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">pledge</span>
          </div>
          <p class="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
            {{ businessProfile?.description | multiLanguage }}
          </p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3 sm:space-y-4 md:space-y-6">
          <h3 class="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4">{{ 'footer.quick_links' | translate }}</h3>
          <ul class="space-y-2 sm:space-y-3">
            <li>
              <a routerLink="/" class="text-xs sm:text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                <i class="pi pi-home text-xs sm:text-sm group-hover:translate-x-1 transition-transform"></i>
                <span>{{ 'navigation.home' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/shop" class="text-xs sm:text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                <i class="pi pi-shopping-bag text-xs sm:text-sm group-hover:translate-x-1 transition-transform"></i>
                <span>{{ 'navigation.shop' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/packages" class="text-xs sm:text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                <i class="pi pi-box text-xs sm:text-sm group-hover:translate-x-1 transition-transform"></i>
                <span>{{ 'navigation.packages' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/faq" class="text-xs sm:text-sm text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                <i class="pi pi-question-circle text-xs sm:text-sm group-hover:translate-x-1 transition-transform"></i>
                <span>{{ 'navigation.faq' | translate }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="space-y-3 sm:space-y-4 md:space-y-6">
          <h3 class="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4">{{ 'footer.contact_info' | translate }}</h3>
          <div class="space-y-3 sm:space-y-4">
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors" role="listitem">
              <i class="pi pi-envelope text-primary-400 text-sm sm:text-base flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true"></i>
              <span class="break-words" aria-label="البريد الإلكتروني">{{ businessProfile?.contactInfo?.email }}</span>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors" role="listitem">
              <i class="pi pi-phone text-primary-400 text-sm sm:text-base flex-shrink-0" aria-hidden="true"></i>
              <span aria-label="رقم الهاتف">{{ businessProfile?.contactInfo?.phone}}</span>
            </div>
            <div class="flex items-start sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors" role="listitem">
              <i class="pi pi-map-marker text-primary-400 text-sm sm:text-base flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden="true"></i>
              <span class="break-words" aria-label="العنوان">{{ businessProfile?.contactInfo?.address  | multiLanguage}}</span>
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="space-y-3 sm:space-y-4 md:space-y-6">
          <h3 class="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4">{{ 'footer.follow_us' | translate }}</h3>
          <div class="space-y-3 sm:space-y-4">
            <div class="flex flex-wrap gap-3 sm:gap-4">
              @if (businessProfile?.socialMedia?.facebook) {
              <a
                 [href]="businessProfile!.socialMedia!.facebook!"
                 target="_blank" rel="noopener noreferrer"
                 class="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                 aria-label="تابعنا على فيسبوك">
                <i class="pi pi-facebook text-white text-sm sm:text-base" aria-hidden="true"></i>
              </a>
              }
              @if (businessProfile?.socialMedia?.twitter) {
              <a
                 [href]="businessProfile!.socialMedia!.twitter!"
                 target="_blank" rel="noopener noreferrer"
                 class="w-9 h-9 sm:w-10 sm:h-10 bg-black hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                 aria-label="تابعنا على تويتر">
                <i class="pi pi-twitter text-white text-sm sm:text-base" aria-hidden="true"></i>
              </a>
              }
              @if (businessProfile?.socialMedia?.instagram) {
              <a
                 [href]="businessProfile!.socialMedia!.instagram!"
                 target="_blank" rel="noopener noreferrer"
                 class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                 aria-label="تابعنا على إنستغرام">
                <i class="pi pi-instagram text-white text-sm sm:text-base" aria-hidden="true"></i>
              </a>
              }
              @if (businessProfile?.socialMedia?.tiktok) {
              <a
                 [href]="businessProfile!.socialMedia!.tiktok!"
                 target="_blank" rel="noopener noreferrer"
                 class="w-9 h-9 sm:w-10 sm:h-10 bg-black hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                 aria-label="تابعنا على تيك توك">
                <i class="pi pi-tiktok text-white text-sm sm:text-base" aria-hidden="true"></i>
              </a>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- Bottom Footer -->
    <div class="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div class="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <!-- Copyright -->
        <p class="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
          {{ 'footer.copyright' | translate: {year: currentYear} }}
        </p>
        <!-- Links -->
        <div class="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs sm:text-sm">
          <a routerLink="/privacy-policy" class="text-gray-400 hover:text-primary-400 transition-colors whitespace-nowrap">{{ 'footer.privacy_policy' | translate }}</a>
          <span class="text-gray-600 hidden sm:inline">|</span>
          <a routerLink="/terms-of-service" class="text-gray-400 hover:text-primary-400 transition-colors whitespace-nowrap">{{ 'footer.terms_of_service' | translate }}</a>
        </div>
      </div>
    </div>
  </footer>
  `,
  styles: [`
    footer {
      position: relative;
      overflow: hidden;
    }

    footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    /* Hover Effects */
    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    /* Newsletter Input Focus */
    input[type="email"]:focus {
      box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
    }

    /* Social Media Icons */
    .pi {
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    /* Animation for Back to Top Button */
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }

    button[class*="fixed"]:hover {
      animation: bounce 1s infinite;
    }

    /* Custom Scrollbar for Footer */
    footer ::-webkit-scrollbar {
      width: 6px;
    }

    footer ::-webkit-scrollbar-track {
      background: #374151;
    }

    footer ::-webkit-scrollbar-thumb {
      background: #8b5cf6;
      border-radius: 3px;
    }

    footer ::-webkit-scrollbar-thumb:hover {
      background: #7c3aed;
    }

    /* Dark mode enhancements */
    @media (prefers-color-scheme: dark) {
      footer {
        background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation: none !important;
        transition: none !important;
      }
    }

  `]
})
export class FooterComponent implements OnInit {
  themeService = inject(ThemeService);
  currentYear = new Date().getFullYear();
  businessProfile: IBusinessProfile | null = null;
  isDarkTheme = computed(() => this.themeService.isDark());
  domain = environment.domain;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private businessProfileService: BusinessProfileService
  ) { }

  ngOnInit() {
    this.loadBusinessProfile();
  }

  // Helper method to add domain prefix to file paths
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${this.domain}/${imagePath}`;
  }

  private loadBusinessProfile() {
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (businessProfile) => {
        this.businessProfile = businessProfile;
      },
      error: (error) => {
      }
    });
  }
  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
