import { Component, OnInit, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { WishlistService } from '../../features/wishlist/services/wishlist.service';
import { MessageService } from 'primeng/api';
import { IWishlistState } from '../../features/wishlist/models/wishlist.interface';
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule as PrimeBadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { CartService } from '../../features/cart/services/cart.service';
import { IUser } from '../../features/auth/models/auth.interface';
import { ICartItem } from '../../features/cart/models/cart.interface';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../service/layout.service';
import { signal } from '@angular/core';

interface IVariant {
  _id: string;
  name: string;
  value: string;
  price: number;
  [key: string]: any; // Allow for additional properties
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    RippleModule,
    TooltipModule,
    PrimeBadgeModule,
    DialogModule,
    InputNumberModule,
    CardModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  LayoutService = inject(LayoutService);
  @ViewChild('cartDialog') cartDialog: any;
  displayCartDialog: boolean = false;
  @ViewChild('userMenu') userMenu!: Menu;
  submenuOpen: boolean = false;
  wishlistOpen: boolean = false;
  cartOpen: boolean = false;
  navbarOpen: boolean = false;
  searchForm: boolean = false;
  categories: boolean = false;
  categoryOne: boolean = true;
  isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);
  searchQuery = '';
  cartItems: any[] = [];
  cartItemCount = 0;
  cartTotal = 0;
  wishlistCount = 0;
  currentUser: IUser | null = null;

  private subscriptions = new Subscription();

  userMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private router: Router,
  ) {
    this.initializeUserMenu();
  }

  ngOnInit(): void {
    // Subscribe to cart state changes
    this.subscriptions.add(
      this.cartService.cartState$.subscribe({
        next: (cartState: { items: ICartItem[]; summary: { total: number } }) => {
          this.cartItems = cartState.items;
          this.cartItemCount = cartState.items.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0);
          this.cartTotal = cartState.summary?.total || 0;
        },
        error: (error: Error) => {
          console.error('Error in cart subscription:', error);
        }
      })
    );

    // Subscribe to wishlist state changes
    this.subscriptions.add(
      this.wishlistService.wishlistState$.subscribe({
        next: (wishlistState: IWishlistState) => {
          this.wishlistCount = wishlistState.count;
        },
        error: (error: Error) => {
          console.error('Error in wishlist subscription:', error);
        }
      })
    );
    

    // Subscribe to auth state changes
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCartButtonClick() {
    this.displayCartDialog = true;
  }

  navigateToWishlist(event: Event) {
    event.preventDefault();
    this.router.navigate(['/wishlist']);
  }

  removeFromCart(item: ICartItem) {
    if (item && item.product && item.product._id) {
      this.cartService.removeItem(item.product._id);
    } else {
      console.error('Cannot remove item: Invalid cart item or product ID');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot remove item: Invalid product'
      });
    }
  }

  updateQuantity(item: ICartItem, quantity: number) {
    if (!item || !item.product || !item.product._id) {
      console.error('Cannot update quantity: Invalid cart item or product ID');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cannot update quantity: Invalid product'
      });
      return;
    }

    const newQuantity = Math.max(1, Math.floor(quantity)); // Ensure quantity is at least 1 and an integer
    
    if (quantity < 1) {
      this.removeFromCart(item);
      return;
    }

    // Convert product._id to string if it's a number
    const productId = item.product._id.toString();
    this.cartService.updateQuantity(productId, quantity);
  }

  viewCart() {
    this.displayCartDialog = false;
    this.router.navigate(['/cart']);
  }

  checkout() {
    this.displayCartDialog = false;
    this.router.navigate(['/checkout']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleSidebar() {
    this.LayoutService.onMenuToggle();
  }
  
  toggleTheme() {
    this.LayoutService.toggleTheme();
  }

  search(event: Event) {
    event.preventDefault();
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
      this.searchQuery = '';
    }
  }

  /**
   * Gets the display name for a variant
   * @param item The cart item containing the variant
   * @returns Formatted variant name or empty string if no variant
   */
  // getVariantName(item: ICartItem): string {
  //   try {
  //     if (!item?.product?.variants?.length) return '';
      
  //     const variant = item.product.variants.find((v: any) => v._id === item.variantId);
  //     if (!variant) return '';
      
  //     return [variant.name, variant.value].filter(Boolean).join(': ');
  //   } catch (error) {
  //     console.error('Error getting variant name:', error);
  //     return '';
  //   }
  // }

  private initializeUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/profile',
        visible: !!this.currentUser
      },
      {
        label: 'Orders',
        icon: 'pi pi-shopping-bag',
        routerLink: '/orders',
        visible: !!this.currentUser
      },
      {
        label: 'Wishlist',
        icon: 'pi pi-heart',
        routerLink: '/wishlist',
        visible: !!this.currentUser
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: '/settings',
        visible: !!this.currentUser
      },
      {
        separator: true,
        visible: !!this.currentUser
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
        visible: !!this.currentUser
      },
      {
        label: 'Login',
        icon: 'pi pi-sign-in',
        routerLink: '/auth/login',
        visible: !this.currentUser
      },
      {
        label: 'Register',
        icon: 'pi pi-user-plus',
        routerLink: '/auth/register',
        visible: !this.currentUser
      }
    ];
  }

  get userInitials(): string {
    if (!this.currentUser) return 'U';
    return (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
  }



  /**
   * Gets the price for a cart item, considering variants if present
   * @param item The cart item to get the price for
   * @returns The price of the item or its variant
   */
  // getVariantPrice(item: ICartItem): number {
  //   try {
  //     if (!item?.product) return 0;
      
  //     // Return base product price if no variant ID is specified
  //     // if (!item.variantId) return item.product.price || 0;
      
  //     // Find the variant and return its price, fallback to product price
  //     const variant = item.product.variants?.find((v: any) => v._id === item.variantId);
  //     return variant?.price ?? item.product.price ?? 0;
  //   } catch (error) {
  //     console.error('Error getting variant price:', error);
  //     return 0;
  //   }
  // }



  toggleRTL() {
    // RTL functionality can be implemented here if needed
    // For now, we'll just log it
    console.log('RTL toggle requested');
  }
}
