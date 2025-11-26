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
  <footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <!-- Main Footer Content -->
    <div class="max-w-7xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <!-- Company Info -->
        <div class="space-y-6 col-span-2">
          <div class="flex items-center gap-3">
            <div class="w-20 h-20 rounded-lg border bg-white dark:bg-gray-800 border-primary-200 flex items-center justify-center">
              @if(isDarkTheme()) {
                <img [src]="getImageUrl(businessProfile?.logo_dark?.filePath || '')" alt="pledge Logo" class="w-full h-full object-contain">
              } @else {
              <img [src]="getImageUrl(businessProfile?.logo_light?.filePath || '')" alt="pledge Logo" class="w-full h-full object-contain">
              }
            </div>  
            <span class="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">pledge</span>
          </div>
          <p class="text-gray-300 leading-relaxed">
            {{ businessProfile?.description | multiLanguage }}
          </p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-6">
          <h4 class="text-xl font-bold text-white mb-4">{{ 'footer.quick_links' | translate }}</h4>
          <ul class="space-y-3">
            <li>
              <a routerLink="/" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-home text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>{{ 'navigation.home' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/shop" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-shopping-bag text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>{{ 'navigation.shop' | translate }}</span>
              </a>
            </li>
            <li>
              <a routerLink="/packages" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-box text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>{{ 'navigation.packages' | translate }}</span>
              </a>
            </li>
            <!-- <li>
              <a routerLink="/about" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-info-circle text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>About Us</span>
              </a>
            </li> -->
            <!-- <li>
              <a routerLink="/contact" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-envelope text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>Contact</span>
              </a>
            </li> -->
            <li>
              <a routerLink="/faq" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-question-circle text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>{{ 'navigation.faq' | translate }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <!-- <div class="space-y-6">
          <h4 class="text-xl font-bold text-white mb-4">Customer Service</h4>
          <ul class="space-y-3">
            <li>
              <a routerLink="/account/profile" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-user text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>My Profile</span>
              </a>
            </li>
            <li>
              <a routerLink="/orders" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-list text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>Order History</span>
              </a>
            </li>
            <li>
              <a routerLink="/wishlist" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-heart text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>Wishlist</span>
              </a>
            </li>
            <li>
              <a routerLink="/track-order" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-search text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>Track Order</span>
              </a>
            </li>
            <li>
              <a routerLink="/support" class="text-gray-300 hover:text-primary-400 transition-colors duration-300 flex items-center space-x-2 group">
                <i class="pi pi-headset text-sm group-hover:translate-x-1 transition-transform me-2"></i>
                <span>Support</span>
              </a>
            </li>
          </ul>
        </div> -->
        <div class="space-y-6">
          <h4 class="text-xl font-bold text-white mb-4">{{ 'footer.contact_info' | translate }}</h4>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <i class="pi pi-envelope text-primary-400"></i>
              <span>{{ businessProfile?.contactInfo?.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <i class="pi pi-phone text-primary-400"></i>
              <span>{{ businessProfile?.contactInfo?.phone}}</span>
            </div>
            <div class="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <i class="pi pi-map-marker text-primary-400"></i>
              <span>{{ businessProfile?.contactInfo?.address  | multiLanguage}}</span>
            </div>
          </div>
        </div>
        <!-- Newsletter & Social -->
        <div class="space-y-6">
          <h4 class="text-xl font-bold text-white mb-4">{{ 'footer.follow_us' | translate }}</h4>

          <!-- Social Media -->
          <div class="space-y-4">
            <div class="flex gap-4">
              <a *ngIf="businessProfile?.socialMedia?.facebook" 
                 [href]="businessProfile!.socialMedia!.facebook!" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <i class="pi pi-facebook text-white"></i>
              </a>
              <a *ngIf="businessProfile?.socialMedia?.twitter" 
                 [href]="businessProfile!.socialMedia!.twitter!" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-10 h-10 bg-black hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <i class="pi pi-twitter text-white"></i>
              </a>
              <a *ngIf="businessProfile?.socialMedia?.instagram" 
                 [href]="businessProfile!.socialMedia!.instagram!" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-10 h-10 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <i class="pi pi-instagram text-white"></i>
              </a>
              <a *ngIf="businessProfile?.socialMedia?.tiktok" 
                 [href]="businessProfile!.socialMedia!.tiktok!" 
                 target="_blank" rel="noopener noreferrer" 
                 class="w-10 h-10 bg-black hover:bg-gray-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                <i class="pi pi-tiktok text-white"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <!-- Copyright -->
          <div class="flex items-center gap-4">
            <p class="text-gray-400 text-sm">
              {{ 'footer.copyright' | translate: {year: currentYear} }}
            </p>
            <div class="flex gap-4 text-sm">
              <a routerLink="/privacy-policy" class="text-gray-400 hover:text-primary-400 transition-colors">{{ 'footer.privacy_policy' | translate }}</a>
              <a routerLink="/terms-of-service" class="text-gray-400 hover:text-primary-400 transition-colors">{{ 'footer.terms_of_service' | translate }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Top Button -->
    <!-- <button (click)="scrollToTop()" 
            class="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-primary-200 to-primary-200 hover:from-primary-700 hover:to-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50">
      <i class="pi pi-arrow-up"></i>
    </button> -->
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
        console.error('Error loading business profile:', error);
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
