import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { catchError, finalize, of, Subscription, takeUntil, tap } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { WishlistService } from '../../features/wishlist/services/wishlist.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { CartService } from '../../features/cart/services/cart.service';
import { IUser } from '../../features/auth/models/auth.interface';
import { IAddToCartRequest, ICartItem, ICartState } from '../../features/cart/models/cart.interface';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../environments/environment';
import { DrawerModule } from 'primeng/drawer';
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

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    DialogModule,
    InputNumberModule,
    CardModule,
    FormsModule,
    ButtonModule,
    DrawerModule,
    ThemeToggleComponent,
    LanguageSwitcherComponent,
    TranslateModule,
    MultiLanguagePipe
  ],
  providers: [MessageService],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent extends ComponentBase implements OnInit, OnDestroy {
  domain = environment.domain;
  @ViewChild('cartDialog') cartDialog: any;
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
  userMenuItems: MenuItem[] = [];
  toggleNavbar(): void {
    this.navbarOpen.set(!this.navbarOpen());
  }
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private router: Router,
    private businessProfileService: BusinessProfileService,
    public themeService: ThemeService
  ) {
    super();
    this.getBusinessProfile();
    this.loadCart();
    this.loadWishlist();
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
    this.loadCategories();
    this.subscriptions.add(
      this.authService.currentUser$.subscribe({
        next: (user: IUser | null) => {
          this.currentUser = user;
          this.initializeUserMenu();
        },
        error: (error: Error) => {
          console.error('Error in user subscription:', error);
        }
      })
    );
  }

  loadCart(): void {
    
    const subscription = this.cartService.cartState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cartItems: ICartState) => {
        this.cartItems.set(cartItems.items);
        this.cartItemCount.set(cartItems.items.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
        this.cartTotal.set(cartItems.items.reduce((total: number, item: ICartItem) => total + ((item.price - (item.discount || 0)) * (item.quantity || 1)), 0));
      },
      error: (error: Error) => {
        console.error('Error loading cart items:', error);
      }
    });
    
  }

  loadWishlist(): void {
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
    });
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
            this.messageService.add({
              severity: 'success',
              summary: 'Added',
              detail: 'Item added to cart',
              life: 1000,
            });
          }),
          catchError((error: any) => {
            console.error('Error adding item:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add item. Please try again.',
              life: 1000,
            });
            return of(null);
          }),
          finalize(() => {
          })
        ).subscribe();
  }

  removeFromCart(item: ICartItem): void {
    console.log('🚨 TOPBAR removeFromCart CALLED!');
    console.log('🗑️ Topbar - removing item:', item);
    console.log('🗑️ Item has packageId:', !!item.packageId);
    console.log('🗑️ Item has productId:', !!item.productId);
    console.log('🗑️ Item type:', item.itemType);
    
    // Check if it's a package or product
    if (item.packageId) {
      console.log('📦 Removing package with ID:', item.packageId);
      // Handle package removal
      this.cartService.removeItem(undefined, undefined, item.packageId).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Package removed from cart',
            life: 1000,
          });
        }),
        catchError((error: any) => {
          console.error('Error removing package:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove package. Please try again.',
            life: 1000,
          });
          return of(null);
        })
      ).subscribe();
    } else if (item.productId) {
      console.log('🛍️ Removing product with ID:', item.productId);
      // Handle product removal
      this.cartService.removeItem(item.productId!, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Product removed from cart',
            life: 1000,
          });
        }),
        catchError((error: any) => {
          console.error('Error removing product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove product. Please try again.',
            life: 1000,
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
    
    console.log('🚨 TOPBAR updateQuantity CALLED!');
    console.log('📦 Updating quantity for item:', item);
    console.log('📦 New quantity:', newQuantity);
    console.log('📦 Item has packageId:', !!item.packageId);
    console.log('📦 Item has productId:', !!item.productId);
    console.log('📦 Item type:', item.itemType);
    
    // Check if it's a package or product
    if (item.packageId && item.itemType === 'package') {
      console.log('📦 Updating package quantity in topbar');
      // Handle package update
      this.cartService.updateQuantity(undefined, newQuantity, item.packageId).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          console.log('📦 Package quantity updated successfully in topbar');
        }),
        catchError((error: any) => {
          console.error('Error updating package quantity in topbar:', error);
          return of(null);
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'product' || !item.itemType)) {
      console.log('🛍️ Updating product quantity in topbar');
      // Handle product update
      this.cartService.updateQuantity(item.productId, newQuantity, undefined, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          console.log('🛍️ Product quantity updated successfully in topbar');
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

  private initializeUserMenu(): void {
    this.userMenuItems = [
      { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile', visible: !!this.currentUser },
      { label: 'Orders', icon: 'pi pi-shopping-bag', routerLink: '/orders', visible: !!this.currentUser },
      { label: 'Wishlist', icon: 'pi pi-heart', routerLink: '/wishlist', visible: !!this.currentUser },
      { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings', visible: !!this.currentUser },
      { separator: true, visible: !!this.currentUser },
      { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout(), visible: !!this.currentUser },
      { label: 'Login', icon: 'pi pi-sign-in', routerLink: '/auth/login', visible: !this.currentUser },
      { label: 'Register', icon: 'pi pi-user-plus', routerLink: '/auth/register', visible: !this.currentUser }
    ];
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    return (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
  }

  toggleRTL(): void {
    console.log('RTL toggle requested');
  }

  getBusinessProfile() {
    this.businessProfileService.getBusinessProfile$().subscribe({
      next: (businessProfile) => {
        this.businessProfile = businessProfile;
      }
    });
  }
}