import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ICartItem, ICartState, ICartSummary, IAddToCartRequest } from '../models/cart.interface';
import { MessageService } from 'primeng/api';
import { MultilingualText } from '../../../core/models/multi-language';
import { ICountry, IState } from '../../../core/models/location.interface';

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
    
    // Check if it's a package or product
    if (item.packageId) {
      console.log('🔄 Adding package to cart:', item);
      console.log('🔄 Package ID:', item.packageId);
      console.log('🔄 Item type:', item.itemType);
      // Handle package
      const existingItemIndex = this.findCartItemIndex(
        currentState.items, 
        undefined, 
        undefined, 
        undefined,
        item.packageId
      );
      
      let updatedItems: ICartItem[];
      
      if (existingItemIndex > -1) {
        console.log('📦 Updating existing package at index:', existingItemIndex);
        // Update existing package
        updatedItems = [...currentState.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
      } else {
        console.log('📦 Adding new package to cart');
        // Add new package
        const newItem: ICartItem = {
          ...item,
          quantity: item.quantity,
          itemType: 'package'
        };
        console.log('📦 New package item:', newItem);
        console.log('📦 New package packageId:', newItem.packageId);
        updatedItems = [...currentState.items, newItem];
      }
      
      console.log('📦 Updated cart items:', updatedItems);
      return this.updateCartState(updatedItems);
    } else {
      // Handle product (existing logic)
      const existingItemIndex = this.findCartItemIndex(
        currentState.items, 
        item.productId!, 
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
          quantity: item.quantity,
          itemType: 'product'
        };
        updatedItems = [...currentState.items, newItem];
      }
      
      return this.updateCartState(updatedItems);
    }
  }

  // Update item quantity (supports both products and packages)
  updateQuantity(
    productId?: string, 
    quantity: number = 1, 
    color?: MultilingualText | null, 
    size?: MultilingualText | null,
    packageId?: string
  ): Observable<ICartState> {
    console.log('🔄 CART SERVICE updateQuantity called:', { productId, quantity, color, size, packageId });
    console.log('🔄 Current cart state:', this.cartState.value);
    
    if (quantity < 1) {
      if (packageId) {
        console.log('📦 Removing package due to quantity < 1');
        return this.removeItem(undefined, undefined, undefined, packageId);
      } else {
        console.log('🛍️ Removing product due to quantity < 1');
        return this.removeItem(productId, color, size);
      }
    }
    
    const currentState = this.cartState.value;
    const itemIndex = this.findCartItemIndex(currentState.items, productId, color, size, packageId);
    
    console.log('🔍 Found item at index:', itemIndex);
    if (itemIndex !== -1) {
      console.log('🔍 Item found:', currentState.items[itemIndex]);
    }
    
    if (itemIndex === -1) {
      console.log('❌ Item not found in cart');
      return of(currentState);
    }
    
    const updatedItems = [...currentState.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: quantity
    };
    
    console.log('✅ Updated item quantity:', updatedItems[itemIndex]);
    console.log('✅ All updated items:', updatedItems);
    return this.updateCartState(updatedItems);
  }

  // Remove item from cart by productId, color, size, or packageId
  removeItem(
    productId?: string, 
    color?: MultilingualText | null, 
    size?: MultilingualText | null,
    packageId?: string
  ): Observable<ICartState> {
    console.log('🗑️ Removing item:', { productId, color, size, packageId });
    console.log('🗑️ PackageId parameter:', packageId);
    console.log('🗑️ PackageId type:', typeof packageId);
    
    const currentState = this.cartState.value;
    console.log('📋 Current cart items before removal:', currentState.items);
    
    const updatedItems = currentState.items.filter((item, index) => {
      console.log(`🔍 Filtering item ${index}:`, {
        packageId: item.packageId,
        productId: item.productId,
        itemType: item.itemType,
        productName: item.productName,
        fullItem: item
      });
      
      if (packageId) {
        // Remove package
        const shouldKeep = item.packageId !== packageId;
        console.log('📦 Package filter:', { 
          itemPackageId: item.packageId, 
          targetPackageId: packageId, 
          shouldKeep,
          itemType: item.itemType,
          comparison: `${item.packageId} !== ${packageId} = ${shouldKeep}`
        });
        return shouldKeep;
      } else if (productId) {
        // Remove product
        const matchesProduct = item.productId === productId;
        const matchesColor = !color || item.color?.en === color?.en;
        const matchesSize = !size || item.size?.en === size?.en;
        const shouldKeep = !(matchesProduct && matchesColor && matchesSize);
        console.log('🛍️ Product filter:', { itemProductId: item.productId, targetProductId: productId, matchesProduct, matchesColor, matchesSize, shouldKeep });
        return shouldKeep;
      }
      console.log('⚠️ No criteria match, keeping item');
      return true; // Keep item if no criteria match
    });
    
    console.log('✅ Items after removal:', updatedItems);
    console.log('📊 Items removed:', currentState.items.length - updatedItems.length);
    return this.updateCartState(updatedItems);
  }

  // Remove item from cart by index (for cases where IDs are missing)
  removeItemByIndex(index: number): Observable<ICartState> {
    console.log('🗑️ Removing item by index:', index);
    
    const currentState = this.cartState.value;
    console.log('📋 Current cart items before removal:', currentState.items);
    
    if (index < 0 || index >= currentState.items.length) {
      console.error('Invalid index for removal:', index);
      return of(currentState);
    }
    
    const itemToRemove = currentState.items[index];
    console.log('🗑️ Item to remove:', itemToRemove);
    console.log('🗑️ Item packageId:', itemToRemove.packageId);
    console.log('🗑️ Item productId:', itemToRemove.productId);
    console.log('🗑️ Item type:', itemToRemove.itemType);
    
    const updatedItems = currentState.items.filter((_, i) => i !== index);
    
    console.log('✅ Items after removal by index:', updatedItems);
    console.log('📊 Items removed:', currentState.items.length - updatedItems.length);
    return this.updateCartState(updatedItems);
  }

  // Add package to cart
  addPackageToCart(packageData: {
    packageId: string;
    quantity: number;
    price: number;
    productName: MultilingualText;
    image: string;
    packageItems?: any[];
    discount?: number;
    selectedVariants?: any;
  }): Observable<ICartState> {
    console.log('📦 Adding package to cart with data:', packageData);
    
    const packageItem: IAddToCartRequest = {
      packageId: packageData.packageId,
      quantity: packageData.quantity,
      price: packageData.price,
      productName: packageData.productName,
      image: packageData.image,
      packageItems: packageData.packageItems,
      discount: packageData.discount,
      selectedVariants: packageData.selectedVariants,
      itemType: 'package'
    };
    
    console.log('📦 Package item to add:', packageItem);
    
    return this.addToCart(packageItem);
  }

  // Clear the entire cart
  clearCart(): Observable<ICartState> {
    return this.updateCartState([]);
  }

  // Update shipping location and recalculate costs
  updateShippingLocation(country: ICountry, state?: IState): Observable<ICartState> {
    console.log('🌍 Updating shipping location:', { country: country.name, state: state?.name });
    
    const currentState = this.cartState.value;
    return this.updateCartState(currentState.items, country, state);
  }

  // Get current cart state
  getCart(): Observable<ICartState> {
    return this.cartState$;
  }

  // Get cart items
  getCartItems(): Observable<ICartItem[]> {
    console.log('🔄 getCartItems() called');
    console.log('🔄 getCartItems() - current cartState$:', this.cartState$);
    console.log('🔄 getCartItems() - current cartState value:', this.cartState.value);
    
    return this.cartState$.pipe(
      map(state => {
        console.log('🔄 getCartItems() - mapping state to items:', state.items);
        return state.items;
      })
    );
  }

  // Get cart item count
  getItemCount(): number {
    return this.cartState.value.summary.itemsCount;
  }

  // Calculate cart summary
  private calculateSummary(items: ICartItem[], selectedCountry?: ICountry, selectedState?: IState): ICartSummary {
    const subtotal = items.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) * item.quantity), 0);
    const taxRate = 0.1; // 10% tax rate - should come from config
    const tax = subtotal * taxRate;
    
    // Calculate shipping cost based on location
    let shippingCost = 0;
    if (selectedCountry) {
      if (selectedState) {
        shippingCost = selectedState.shippingCost;
      } else {
        shippingCost = selectedCountry.defaultShippingCost;
      }
    } else {
      // Default shipping logic if no location selected
      shippingCost = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0; // Free shipping over $50
    }
    
    const discount = 0; // Can be calculated based on coupons/discounts
    
    return {
      subtotal: this.roundToTwoDecimals(subtotal),
      discount: this.roundToTwoDecimals(discount),
      total: this.roundToTwoDecimals(subtotal + tax + shippingCost - discount),
      itemsCount: items.reduce((count, item) => count + item.quantity, 0),
      selectedCountry,
      selectedState,
      shippingCost: this.roundToTwoDecimals(shippingCost)
    };
  }

  // Update cart state and notify subscribers
  private updateCartState(items: ICartItem[], selectedCountry?: ICountry, selectedState?: IState): Observable<ICartState> {    
    console.log('🔄 Updating cart state with items:', items);
    console.log('🔄 Items count:', items.length);
    items.forEach((item, index) => {
      console.log(`🔄 Item ${index}:`, {
        packageId: item.packageId,
        productId: item.productId,
        itemType: item.itemType,
        productName: item.productName
      });
    });
    
    const summary = this.calculateSummary(items, selectedCountry, selectedState);
    const newState: ICartState = { items, summary };
    
    console.log('📊 New cart state:', newState);
    
    // In a real app, you would make an API call here to sync with the server
    // For now, we'll just update the local state
    console.log('🔄 Calling cartState.next() with new state');
    this.cartState.next(newState);
    console.log('🔄 cartState.next() completed');
    
    return of(newState);
  }

  // Find item index in cart by productId, color, size, or packageId
  private findCartItemIndex(
    items: ICartItem[], 
    productId?: string, 
    color?: MultilingualText | null, 
    size?: MultilingualText | null,
    packageId?: string
  ): number {
    return items.findIndex(item => {
      if (packageId) {
        // Looking for a package
        return item.packageId === packageId;
      } else if (productId) {
        // Looking for a product
        return item.productId === productId &&
               (!color || item.color?.en === color?.en) &&
               (!size || item.size?.en === size?.en);
      }
      return false;
    });
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
        discount: 0,
        total: 0,
        itemsCount: 0,
        shippingCost: 0
      }
    };
  }

}
