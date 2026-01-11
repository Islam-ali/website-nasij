import { Component, DestroyRef, Injector, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../core/services/loading.service';
import { UiToastContainerComponent, UiSpinnerComponent } from '../shared/ui';
import { BusinessProfileService } from '../services/business-profile.service';
import { IBusinessProfile } from '../interfaces/business-profile.interface';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TopbarComponent,
    FooterComponent,
    UiToastContainerComponent,
    UiSpinnerComponent
  ],
  template: `
    <app-topbar></app-topbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <ui-toast-container position="top-right"></ui-toast-container>
    
    @if (loading$ | async) {
    <div class="loading-overlay">
      <ui-spinner size="lg"></ui-spinner>
    </div>
    }
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 12rem);
    }
    
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1100;
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  loading$: Observable<boolean>;
  private destroy$ = new Subject<void>();
  
  // Local layout config signal
  // private layoutConfig = signal<layoutConfig>({
  //   preset: 'Aura',
  //   primary: 'emerald',
  //   surface: null,
  //   darkTheme: false,
  //   menuMode: 'static'
  // });
  
  // Public computed property for template
  // config = this.layoutConfig.asReadonly();

  constructor(
    private loadingService: LoadingService,
    // private layoutService: LayoutService,
    private router: Router,
    private route: ActivatedRoute,
    private businessProfileService: BusinessProfileService
  ) {
    this.loading$ = this.loadingService.loading$;
    
    // Initialize with current layout config
    // this.layoutConfig.set(this.layoutService.layoutConfig());
  }

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  
  ngOnInit() {
    // Get business profile from resolver data
    const resolvedBusinessProfile = this.route.snapshot.data['businessProfile'] as IBusinessProfile | null;
    if (resolvedBusinessProfile) {
      // Set it in the service so all components can access it
      this.businessProfileService.setBusinessProfile(resolvedBusinessProfile);
    }
    
    // Also subscribe to route data changes in case of navigation
    this.route.data.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      const businessProfile = data['businessProfile'] as IBusinessProfile | null;
      if (businessProfile) {
        this.businessProfileService.setBusinessProfile(businessProfile);
      }
    });
    
    // Use runInInjectionContext to ensure proper injection context for the effect
    Promise.resolve().then(() => {
      // Update layout config when it changes
      effect(() => {
        // const config = this.layoutService.layoutConfig();
        // this.layoutConfig.set(config);
        // this.updateTheme(config.darkTheme ?? false);
      }, { injector: this.injector });
    });
    
    // Handle initial theme
    // this.updateTheme(this.layoutConfig().darkTheme ?? false);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // private updateTheme(isDark: boolean) {
  //   // Add/remove dark theme class from html element for better theming support
  //   const html = document.documentElement;
  //   if (isDark) {
  //     html.classList.add('dark-theme');
  //     html.setAttribute('data-theme', 'dark');
  //   } else {
  //     html.classList.remove('dark-theme');
  //     html.removeAttribute('data-theme');
  //   }
  // }
  
  // toggleTheme() {
  //   this.layoutService.toggleTheme();
  // }
  
  // isDarkTheme(): boolean {
  //   return this.config().darkTheme ?? false;
  // }
  
  // toggleSidebar() {
  //   this.layoutService.onMenuToggle();
  // }
}
