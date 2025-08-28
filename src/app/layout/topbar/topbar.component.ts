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
import { LayoutService } from '../service/layout.service';
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
    ThemeToggleComponent
  ],
  providers: [MessageService],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent extends ComponentBase implements OnInit, OnDestroy {
  domain = environment.domain;
  LayoutService = inject(LayoutService);
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

  updateCartQuantity(item: ICartItem, quantity: number): void {
    this.cartService.updateQuantity(item.productId, quantity, item.color, item.size).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Item quantity updated',
          life: 1000,
        });
      })
    ).subscribe();
  }

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
    this.cartService.getCartItems().subscribe({
      next: (cartItems: ICartItem[]) => {
        this.cartItems.set(cartItems);
        this.cartItemCount.set(cartItems.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
        this.cartTotal.set(cartItems.reduce((total: number, item: ICartItem) => total + (item.price * (item.quantity || 1)), 0));
      },
      error: (error: Error) => {
        console.error('Error loading cart items:', error);
      }
    });
  }

  loadWishlist(): void {
    this.wishlistService.wishlistState$.subscribe({
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
      color: item.color,
      size: item.size,
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
    this.cartService.removeItem(item.productId, item.color, item.size).pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Removed',
              detail: 'Item removed from cart',
              life: 1000,
            });
          }),
          catchError((error: any) => {
            console.error('Error removing item:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove item. Please try again.',
              life: 1000,
            });
            return of(null);
          }),
          finalize(() => {
          })
        ).subscribe();
  }

  updateQuantity(item: ICartItem, quantity: number): void {
    const newQuantity = Math.max(1, Math.floor(quantity));
    const updatedCart = this.cartItems().map(cartItem =>
      cartItem.productId === item.productId ? { ...cartItem, quantity: newQuantity } : cartItem
    );
    this.cartItems.set(updatedCart);
    this.cartItemCount.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
    this.cartTotal.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.price * (item.quantity || 1)), 0));
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

  toggleSidebar(): void {
    this.LayoutService.onMenuToggle();
  }



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