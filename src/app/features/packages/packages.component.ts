import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Modules
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { IPackage } from '../../interfaces/package.interface';
import { PackageService } from './services/package.service';
import { ComponentBase } from '../../core/directives/component-base.directive';
import { BaseResponse } from '../../core/models/baseResponse';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';

@Component({
  selector: 'app-packages',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RatingModule,
    ChipModule,
    SkeletonModule,
    MessageModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    IconFieldModule,
    InputIconModule,
    TranslateModule,
    MultiLanguagePipe
  ],
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss']
})
export class PackagesComponent extends ComponentBase implements OnInit, OnDestroy {
  packages = signal<IPackage[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = '';
  selectedCategory = 'all';
  sortBy = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';
  router = inject(Router);
  categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Home & Garden', value: 'home-garden' },
    { label: 'Sports', value: 'sports' },
    { label: 'Books', value: 'books' }
  ];

  sortOptions = [
    { label: 'Name A-Z', value: 'name', order: 'asc' },
    { label: 'Name Z-A', value: 'name', order: 'desc' },
    { label: 'Price Low-High', value: 'price', order: 'asc' },
    { label: 'Price High-Low', value: 'price', order: 'desc' },
    { label: 'Newest First', value: 'createdAt', order: 'desc' },
    { label: 'Oldest First', value: 'createdAt', order: 'asc' }
  ];

  constructor(
    private packageService: PackageService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] || 'all';
      this.loadPackages();
    });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPackages(): void {
    this.loading.set(true);
    this.error.set(null);
    const filter: any = {};
    if (this.selectedCategory !== 'all') {
      filter.category = this.selectedCategory;
    }
    this.packageService.getPackages(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (packages: BaseResponse<IPackage[]> ) => {
          this.packages.set(packages.data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load packages. Please try again later.');
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load packages'
          });
        }
      });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.packageService.searchPackages(this.searchQuery.trim())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (packages) => {
            this.packages.set(packages);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Search failed'
            });
          }
        });
    } else {
      this.loadPackages();
    }
  }

  onCategoryChange(): void {
    if (this.selectedCategory === 'all') {
      this.loadPackages();
    } else {
      this.packageService.getPackagesByCategory(this.selectedCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (packages) => {
            this.packages.set(packages);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to filter packages'
            });
          }
        });
    }
  }

  onSortChange(): void {
    const [field, order] = this.sortBy.split('-');
    this.sortOrder = order as 'asc' | 'desc';
    
    const sortedPackages = [...this.packages()].sort((a, b) => {
      let aValue: any = a[field as keyof IPackage];
      let bValue: any = b[field as keyof IPackage];

      if (field === 'price') {
        aValue = a.discountPrice || a.price;
        bValue = b.discountPrice || b.price;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.packages.set(sortedPackages);
  }

  getMainImage(pkg: IPackage): string {
    return pkg.images && pkg.images.length > 0 
      ? pkg.images[0]?.filePath
      : 'assets/images/placeholder.jpg';
  }

  getDiscountPercentage(pkg: IPackage): number {
    console.log(pkg);
    if (!pkg.discountPrice) return 0;
    
    return Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100);
  }

  getItemsCount(pkg: IPackage): number {
    return pkg.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  getTags(pkg: IPackage): string[] {
    return pkg.tags?.slice(0, 3) || [];
  }

  getRatingStars(rating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (hasHalfStar) {
      stars.push(0.5);
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(0);
    }
    return stars;
  }

  viewPackage(pkg: IPackage): void {
    this.router.navigate(['/packages', pkg._id]);
  }

  addToCart(pkg: IPackage): void {
    // This will be implemented when we integrate with cart service
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Package added to cart'
    });
  }

  addToWishlist(pkg: IPackage): void {
    // This will be implemented when we integrate with wishlist service
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Package added to wishlist'
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder.jpg';
    }
  }
}
