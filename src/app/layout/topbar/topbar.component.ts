import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Subscription } from 'rxjs';
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
import { ICartItem } from '../../features/cart/models/cart.interface';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../service/layout.service';
import { ButtonModule } from 'primeng/button';
import { environment } from '../../../environments/environment';
import { DrawerModule } from 'primeng/drawer';
import { IWishlistItem, IWishlistState } from '../../features/wishlist/models/wishlist.interface';

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
    DrawerModule
  ],
  providers: [MessageService],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  domain = environment.domain;
  LayoutService = inject(LayoutService);
  @ViewChild('cartDialog') cartDialog: any;
  submenuOpen: boolean = false;
  wishlistOpen: boolean = false;
  cartOpen: boolean = false;
  navbarOpen = signal(false);
  searchForm: boolean = false;
  categories: boolean = false;
  categoryOne: boolean = true;
  isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);
  searchQuery = '';
  cartItems = signal<ICartItem[]>([]);
  wishlistItems = signal<IWishlistItem[]>([]);
  cartItemCount = signal<number>(0);
  cartTotal = signal<number>(0);
  wishlistCount = signal<number>(0);
  currentUser: IUser | null = null;
  menuItems: MenuItem[] = [
    // { label: 'Home', icon: 'pi pi-home', routerLink: '/' },
    { label: 'Shop', icon: 'pi pi-shopping-cart', routerLink: '/shop' },
    {
      label: 'Products',
      icon: 'pi pi-box',
      items: [
        { label: 'Dresses', routerLink: '/shop' },
        { label: 'Jackets', routerLink: '/shop' },
        { label: 'Sweatshirts', routerLink: '/shop' },
        { label: 'Tops & Tees', routerLink: '/shop' },
        { label: 'Party Dresses', routerLink: '/shop' }
      ]
    },
    // { label: 'Accessories', icon: 'pi pi-gift', routerLink: '/accessories' },
    { label: 'Contact', icon: 'pi pi-envelope', routerLink: '/contact' }
  ];
  private subscriptions = new Subscription();

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
  ) {
    this.loadCartFromLocalStorage();
    this.loadWishlist();
  }

  ngOnInit(): void {
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

  loadCartFromLocalStorage(): void {
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

  saveCartToLocalStorage(): void {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems()));
  }

  saveWishlistToLocalStorage(): void {
    localStorage.setItem('wishlistItems', JSON.stringify(this.wishlistItems()));
  }

  addToCart(item: any): void {
    const existingItemIndex = this.cartItems().findIndex(cartItem => cartItem.productId === item.productId);
    if (existingItemIndex > -1) {
      const updatedCart = this.cartItems();
      updatedCart[existingItemIndex].quantity!++;
      this.cartItems.set(updatedCart);
    } else {
      this.cartItems.set([...this.cartItems(), { ...item, quantity: 1 }]);
    }
    this.cartItemCount.set(this.cartItems().reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
    this.cartTotal.set(this.cartItems().reduce((total: number, item: ICartItem) => total + (item.price * (item.quantity || 1)), 0));
    this.saveCartToLocalStorage();
  }

  removeFromCart(item: ICartItem): void {
    const updatedCart = this.cartItems().filter(cartItem => cartItem.productId !== item.productId);
    this.cartItems.set(updatedCart);
    this.cartItemCount.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
    this.cartTotal.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.price * (item.quantity || 1)), 0));
    this.saveCartToLocalStorage();
  }

  updateQuantity(item: ICartItem, quantity: number): void {
    const newQuantity = Math.max(1, Math.floor(quantity));
    const updatedCart = this.cartItems().map(cartItem =>
      cartItem.productId === item.productId ? { ...cartItem, quantity: newQuantity } : cartItem
    );
    this.cartItems.set(updatedCart);
    this.cartItemCount.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.quantity || 0), 0));
    this.cartTotal.set(updatedCart.reduce((total: number, item: ICartItem) => total + (item.price * (item.quantity || 1)), 0));
    this.saveCartToLocalStorage();
  }

  addToWishlist(item: any): void {
    const existingItemIndex = this.wishlistItems().findIndex(wishlistItem => wishlistItem.productId === item.productId);
    if (existingItemIndex === -1) {
      this.wishlistItems.set([...this.wishlistItems(), item]);
      this.wishlistCount.set(this.wishlistItems().length);
      this.saveWishlistToLocalStorage();
    }
  }

  removeFromWishlist(item: any): void {
    const updatedWishlist = this.wishlistItems().filter(wishlistItem => wishlistItem.productId !== item.productId);
    this.wishlistItems.set(updatedWishlist);
    this.wishlistCount.set(updatedWishlist.length);
    this.saveWishlistToLocalStorage();
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

  toggleTheme(): void {
    this.LayoutService.toggleTheme();
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
}