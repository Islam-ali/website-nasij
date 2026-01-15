import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IWishlistItem, IWishlistState, IAddToWishlistRequest } from '../models/wishlist.interface';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class WishlistService implements OnDestroy {
  private readonly WISHLIST_STORAGE_KEY = 'pledge_wishlist';
  private wishlistState = new BehaviorSubject<IWishlistState>(this.getInitialWishlistState());
  private subscriptions = new Subscription();

  // Public observable of wishlist state
  wishlistState$ = this.wishlistState.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load wishlist from storage on service initialization
    this.loadWishlistFromStorage();
    
    // Save wishlist to storage whenever it changes
    this.subscriptions.add(
      this.wishlistState$.subscribe(wishlist => {
        this.saveWishlistToStorage(wishlist);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Add item to wishlist
  addToWishlist(item: IAddToWishlistRequest): Observable<IWishlistState> {
    const currentState = this.wishlistState.value;
    const existingItemIndex = this.findWishlistItemIndex(currentState.items, item.productId);
    
    if (existingItemIndex > -1) {
      // Item already in wishlist
      return of(currentState);
    }
    
    // Add new item
    const newItem: IWishlistItem = {
      product: item.product,
      productId: item.productId,
      addedAt: new Date(),
      price: item.product.price,
      productName: item.product.name,
      image: item.product.images[0].filePath,
      selectedVariants: item.selectedVariants || []
    };
    
    const updatedItems = [...currentState.items, newItem];
    
    return this.updateWishlistState(updatedItems);
  }

  // Remove item from wishlist
  removeFromWishlist(productId: string): Observable<IWishlistState> {
    const currentState = this.wishlistState.value;
    const updatedItems = currentState.items.filter(
      item => !(item.productId === productId)
    );
    
    return this.updateWishlistState(updatedItems);
  }

  // Move item from wishlist to cart
  moveToCart(item: IWishlistItem): Observable<{wishlist: IWishlistState}> {
    // In a real app, this would make an API call to move the item
    // For now, we'll just remove it from the wishlist and return the updated state
    return this.removeFromWishlist(item.productId).pipe(
      map(wishlist => ({ wishlist }))
    );
  }

  // Check if a product is in the wishlist
  isInWishlist(productId: string, variantId?: string): boolean {
    return this.findWishlistItemIndex(this.wishlistState.value.items, productId, variantId) > -1;
  }

  // Get current wishlist state
  getWishlist(): IWishlistState {
    return this.wishlistState.value;
  }

  // Clear the entire wishlist
  clearWishlist(): Observable<IWishlistState> {
    return this.updateWishlistState([]);
  }

  // Update wishlist state and notify subscribers
  private updateWishlistState(items: IWishlistItem[]): Observable<IWishlistState> {
    const newState: IWishlistState = {
      items,
      summary: {
        itemsCount: items.length
      }
    };
    
    // In a real app, you would make an API call here to sync with the server
    this.wishlistState.next(newState);
    
    return of(newState);
  }

  // Find item index in wishlist
  private findWishlistItemIndex(items: IWishlistItem[], productId: string, variantId?: string): number {
    return items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    );
  }

  // Load wishlist from localStorage
  private loadWishlistFromStorage(): void {
    try {
      if (isPlatformBrowser(this.platformId)) {
      const savedWishlist = localStorage.getItem(this.WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Validate the loaded wishlist structure
        if (parsedWishlist && Array.isArray(parsedWishlist.items)) {
          // Convert string dates back to Date objects
          const itemsWithDates = parsedWishlist.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }));
          
          this.wishlistState.next({
            items: itemsWithDates,
            summary: {
              itemsCount: itemsWithDates.length
            }
          });
        }
      }
      }
    } catch (error) {
      // Reset to initial state if there's an error
      this.wishlistState.next(this.getInitialWishlistState());
    }
  }

  // Save wishlist to localStorage
  private saveWishlistToStorage(wishlist: IWishlistState): void {
    if (isPlatformBrowser(this.platformId)) { 
      try {
        localStorage.setItem(this.WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (error) {
      }
    }
  }

  // Get initial wishlist state
  private getInitialWishlistState(): IWishlistState {
    return {
      items: [],
      summary: {
        itemsCount: 0
      }
    };
  }
}
