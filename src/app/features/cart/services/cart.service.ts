import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ICartItem, ICartState, ICartSummary, IAddToCartRequest } from '../models/cart.interface';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private readonly CART_STORAGE_KEY = 'pledge_cart';
  private cartState = new BehaviorSubject<ICartState>(this.getInitialCartState());
  private subscriptions = new Subscription();

  // Public observable of cart state
  cartState$ = this.cartState.asObservable();

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {
    // Load cart from storage on service initialization
    this.loadCartFromStorage();
    
    // Save cart to storage whenever it changes
    this.subscriptions.add(
      this.cartState$.subscribe(cart => {
        this.saveCartToStorage(cart);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Add item to cart or update quantity if item exists
  addToCart(item: IAddToCartRequest): Observable<ICartState> {
    const currentState = this.cartState.value;
    const existingItemIndex = this.findCartItemIndex(
      currentState.items, 
      item.productId, 
      item.color, 
      item.size
    );
    
    let updatedItems: ICartItem[];
    
    if (existingItemIndex > -1) {
      // Update existing item
      updatedItems = [...currentState.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity
      };
    } else {
      // Add new item
      const newItem: ICartItem = {
        ...item,
        quantity: item.quantity
      };
      updatedItems = [...currentState.items, newItem];
    }
    
    return this.updateCartState(updatedItems);
  }

  // Update item quantity
  updateQuantity(
    productId: string, 
    quantity: number, 
    color?: string, 
    size?: string
  ): Observable<ICartState> {
    if (quantity < 1) {
      return this.removeItem(productId, color, size);
    }
    
    const currentState = this.cartState.value;
    const itemIndex = this.findCartItemIndex(currentState.items, productId, color, size);
    
    if (itemIndex === -1) {
      return of(currentState);
    }
    
    const updatedItems = [...currentState.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: quantity
    };
    
    return this.updateCartState(updatedItems);
  }

  // Remove item from cart by productId, color, and size
  removeItem(
    productId: string, 
    color?: string, 
    size?: string
  ): Observable<ICartState> {
    const currentState = this.cartState.value;
    const updatedItems = currentState.items.filter(item => {
      const matchesProduct = item.productId === productId;
      const matchesColor = !color || item.color === color;
      const matchesSize = !size || item.size === size;
      return !(matchesProduct && matchesColor && matchesSize);
    });
    
    return this.updateCartState(updatedItems);
  }

  // Clear the entire cart
  clearCart(): Observable<ICartState> {
    return this.updateCartState([]);
  }

  // Get current cart state
  getCart(): Observable<ICartState> {
    return this.cartState$;
  }

  // Get cart items
  getCartItems(): Observable<ICartItem[]> {
    return this.cartState$.pipe(
      map(state => state.items)
    );
  }

  // Get cart item count
  getItemCount(): number {
    return this.cartState.value.summary.itemsCount;
  }

  // Calculate cart summary
  private calculateSummary(items: ICartItem[]): ICartSummary {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.1; // 10% tax rate - should come from config
    const tax = subtotal * taxRate;
    const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0; // Free shipping over $50
    const discount = 0; // Can be calculated based on coupons/discounts
    
    return {
      subtotal: this.roundToTwoDecimals(subtotal),
      shipping: this.roundToTwoDecimals(shipping),
      discount: this.roundToTwoDecimals(discount),
      total: this.roundToTwoDecimals(subtotal + tax + shipping - discount),
      itemsCount: items.reduce((count, item) => count + item.quantity, 0)
    };
  }

  // Update cart state and notify subscribers
  private updateCartState(items: ICartItem[]): Observable<ICartState> {    
    
    const summary = this.calculateSummary(items);
    const newState: ICartState = { items, summary };
    
    // In a real app, you would make an API call here to sync with the server
    // For now, we'll just update the local state
    this.cartState.next(newState);
    
    return of(newState);
  }

  // Find item index in cart by productId, color, and size
  private findCartItemIndex(
    items: ICartItem[], 
    productId: string, 
    color?: string, 
    size?: string
  ): number {
    return items.findIndex(item => 
      item.productId === productId &&
      (!color || item.color === color) &&
      (!size || item.size === size)
    );
  }

  // Round to 2 decimal places for currency
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // Load cart from localStorage
  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        
        // Validate the loaded cart structure
        if (parsedCart && Array.isArray(parsedCart.items)) {
          // Ensure quantity is a number
          const validatedItems = parsedCart.items.map((item: any) => ({
            ...item,
            quantity: Number(item.quantity) || 1
          }));
          
          
          this.cartState.next({
            items: validatedItems,
            summary: this.calculateSummary(validatedItems)
          });
        }
      }
    } catch (error) {
      // Reset to initial state if there's an error
      this.cartState.next(this.getInitialCartState());
    }
  }

  // Save cart to localStorage
  private saveCartToStorage(cart: ICartState): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  // Get initial cart state
  private getInitialCartState(): ICartState {
    return {
      items: [],
      summary: {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        itemsCount: 0
      }
    };
  }

}
