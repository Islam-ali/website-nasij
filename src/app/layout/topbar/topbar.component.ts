import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, finalize, of, Subscription, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { WishlistService } from '../../features/wishlist/services/wishlist.service';
import { CartService } from '../../features/cart/services/cart.service';
import { IUser } from '../../features/auth/models/auth.interface';
import { IAddToCartRequest, ICartItem, ICartState } from '../../features/cart/models/cart.interface';
import { environment } from '../../../environments/environment';
import { IWishlistItem, IWishlistState } from '../../features/wishlist/models/wishlist.interface';
import { ComponentBase } from '../../core/directives/component-base.directive';
import { ICategory } from '../../interfaces/category.interface';
import { CategoryService } from '../../features/products/services/category.service';
import { BaseResponse } from '../../core/models/baseResponse';
import { IBusinessProfile } from '../../interfaces/business-profile.interface';
import { BusinessProfileService } from '../../services/business-profile.service';
import { ThemeService } from '../../core/services/theme.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { CurrencyPipe } from '../../core/pipes/currency.pipe';
import { FallbackImgDirective } from '../../core/directives';
import { UiToastService } from '../../shared/ui';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleComponent,
    LanguageSwitcherComponent,
    TranslateModule,
    MultiLanguagePipe,
    CurrencyPipe,
    FallbackImgDirective
  ],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent extends ComponentBase implements OnInit, OnDestroy {
  domain = environment.domain;
  submenuOpen: boolean = false;
  wishlistOpen: boolean = false;
  cartOpen: boolean = false;
  navbarOpen = signal(false);
  searchForm: boolean = false;
  categories = signal<ICategory[]>([]);
  isDarkTheme = computed(() => this.themeService.isDark());
  searchQuery = '';
  cartItems = signal<ICartItem[]>([]);
  wishlistItems = signal<IWishlistItem[]>([]);
  cartItemCount = signal<number>(0);
  cartTotal = signal<number>(0);
  wishlistCount = signal<number>(0);
  currentUser: IUser | null = null;
  private subscriptions = new Subscription();
  businessProfile: IBusinessProfile | null = null;
  toggleNavbar(): void {
    this.navbarOpen.set(!this.navbarOpen());
  }
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: UiToastService,
    private router: Router,
    private businessProfileService: BusinessProfileService,
    public themeService: ThemeService
  ) {
    super();
    this.getBusinessProfile();
  }

  private categoryService = inject(CategoryService);

  // load categories  
  loadCategories(): void {
    this.categoryService.listCategories().pipe(
      takeUntil(this.destroy$),
      tap((response: BaseResponse<ICategory[]>) => {
        this.categories.set(response.data);
      })
    ).subscribe();
  }

  ngOnInit(): void {
    console.log('Topbar component initialized');
    this.loadCategories();
    this.loadCart();
    this.loadWishlist();
    this.subscriptions.add(
      this.authService.currentUser$.subscribe({
        next: (user: IUser | null) => {
          this.currentUser = user;
        },
        error: (error: Error) => {
          console.error('Error in user subscription:', error);
        }
      })
    );
  }

  loadCart(): void {
    this.subscriptions.add(
      this.cartService.cartState$.pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (cartState: ICartState) => {
          console.log('Cart state updated in topbar:', cartState);
          this.cartItems.set(cartState.items);
          // Calculate total quantity of all items
          const totalCount = cartState.items.reduce((total: number, item: ICartItem) => {
            return total + (item.quantity || 0);
          }, 0);
          console.log('Cart item count updated:', totalCount);
          this.cartItemCount.set(totalCount);
          // Use summary total instead of recalculating
          this.cartTotal.set(cartState.summary.total);
        },
        error: (error: Error) => {
          console.error('Error loading cart items:', error);
        }
      })
    );
  }

  loadWishlist(): void {
    this.subscriptions.add(
      this.wishlistService.wishlistState$.pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (state: IWishlistState) => {
          this.wishlistItems.set(state.items);
          this.wishlistCount.set(state.summary.itemsCount);
        },
        error: (error: Error) => {
          console.error('Error loading wishlist items:', error);
        }
      })
    );
  }

  addToCart(item: any): void {
    const newItem: IAddToCartRequest = {
      productId: item.productId,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      selectedVariants: item.selectedVariants,
      productName: item.productName,
      discount: item.discount,
    };
    this.cartService.addToCart(newItem).pipe(
          takeUntil(this.destroy$),
          tap(() => {
          this.toastService.add({
            severity: 'success',
            summary: 'Added',
            detail: 'Item added to cart',
            life: 1500,
          });
          }),
          catchError((error: any) => {
            console.error('Error adding item:', error);
          this.toastService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add item. Please try again.',
            life: 2000,
          });
            return of(null);
          }),
          finalize(() => {
          })
        ).subscribe();
  }

  removeFromCart(item: ICartItem): void {    
    // Check if it's a package or product
    if (item.packageId) {
      // Handle package removal
      this.cartService.removeItem(undefined, undefined, item.packageId).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Package removed from cart',
            life: 1500,
          });
        }),
        catchError((error: any) => {
          console.error('Error removing package:', error);
          this.toastService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove package. Please try again.',
            life: 1500,
          });
          return of(null);
        })
      ).subscribe();
    } else if (item.productId) {
      // Handle product removal
      this.cartService.removeItem(item.productId!, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Product removed from cart',
            life: 1500,
          });
        }),
        catchError((error: any) => {
          console.error('Error removing product:', error);
          this.toastService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove product. Please try again.',
            life: 1500,
          });
          return of(null);
        }),
        finalize(() => {
        })
      ).subscribe();
    } else {
      console.error('Invalid item type for removal:', item);
    }
  }

  updateQuantity(item: ICartItem, quantity: number): void {
    const newQuantity = Math.max(1, Math.floor(quantity));
    
    
    
    // Check if it's a package or product
    if (item.packageId && item.itemType === 'Package') {
      // Handle package update
      this.cartService.updateQuantity(undefined, newQuantity, item.packageId).pipe(
        takeUntil(this.destroy$),
        tap(() => {
        }),
        catchError((error: any) => {
          console.error('Error updating package quantity in topbar:', error);
          return of(null);
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'Product' || !item.itemType)) {
      // Handle product update
      this.cartService.updateQuantity(item.productId, newQuantity, undefined, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
        }),
        catchError((error: any) => {
          console.error('Error updating product quantity in topbar:', error);
          return of(null);
        })
      ).subscribe();
    } else {
      console.error('Invalid item type for quantity update in topbar:', item);
    }
  }

  addToWishlist(item: any): void {
    const existingItemIndex = this.wishlistItems().findIndex(wishlistItem => wishlistItem.productId === item.productId);
    if (existingItemIndex === -1) {
      this.wishlistItems.set([...this.wishlistItems(), item]);
      this.wishlistCount.set(this.wishlistItems().length);
    }
  }

  removeFromWishlist(item: any): void {
    const updatedWishlist = this.wishlistItems().filter(wishlistItem => wishlistItem.productId !== item.productId);
    this.wishlistItems.set(updatedWishlist);
    this.wishlistCount.set(updatedWishlist.length);
  }

  navigateToWishlist(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/wishlist']);
    this.wishlistOpen = false;
  }

  viewCart(): void {
    this.cartOpen = false;
    this.router.navigate(['/cart']);
  }

  checkout(): void {
    this.cartOpen = false;
    this.router.navigate(['/checkout']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // toggleSidebar(): void {
  //   this.LayoutService.onMenuToggle();
  // }



  search(event: Event): void {
    event.preventDefault();
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.searchQuery = '';
    }
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    return (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
  }

  toggleRTL(): void {
  }

  getImageUrl(filePath: string): string {
    return `${this.domain}/${filePath}`;
  }

  getBusinessProfile() {
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (businessProfile) => {
        this.businessProfile = businessProfile;
      }
    });
  }
}