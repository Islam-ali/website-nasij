import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject, Subscription, of, forkJoin } from 'rxjs';
import { map, switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { CartService } from '../cart/services/cart.service';
import { IWishlistState, IWishlistItem } from './models/wishlist.interface';
import { ProductService } from '../products/services/product.service';
import { WishlistService } from './services/wishlist.service';
import { IAddToCartRequest } from '../cart/models/cart.interface';
import { environment } from '../../../environments/environment';
import { MultilingualText } from '../../core/models/multi-language';

@Component({  
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
    RippleModule,
    DividerModule
],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: IWishlistItem[] = [];
  loading = false;
  domain = environment.domain;
  private destroy$ = new Subject<void>();
  private subscriptions = new Subscription();
  selectedItem: IWishlistItem | null = null;
  
  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private messageService: MessageService,
    private router: Router,
    private productService: ProductService
  ) {

  }

  ngOnInit(): void {
    // In a real app, you might want to load additional product details here
    this.loadWishlistProducts();
  }



  // Remove item from wishlist
  removeFromWishlist(item: IWishlistItem): void {
    this.loading = true;
    this.wishlistService.removeFromWishlist(item.productId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Item removed from wishlist.'
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove item from wishlist. Please try again.'
        });
        this.loading = false;
      }
    });
  }

  // Move item to cart
  moveToCart(item: IWishlistItem): void {
    if (!item.product || !item.selectedVariants) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'must select variants'
      });
      return;
    }

    this.loading = true;
    
    const cartItem: IAddToCartRequest = {
      productId: item.productId,
      price: item.product.price || 0,
      image: item.product.images?.[0]?.filePath || '',
      quantity: 1,
      selectedVariants: item.selectedVariants || [],
      productName: item.product.name || 'Product',
      discount: item.product.discountPrice || 0,
    };
    
    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        // Remove from wishlist after adding to cart
        this.wishlistService.removeFromWishlist(item.productId).subscribe({
          next: () => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Moved to Cart',
              detail: 'Item has been moved to your cart.'
            });
          },
          error: (error) => {
            console.error('Error removing from wishlist:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add item to cart. Please try again.'
        });
        this.loading = false;
      }
    });
  }

  // select color and size
  // selectedSize(item: IWishlistItem, size: MultilingualText): void {
  //   const newItem = this.wishlistItems.find((i) => i.productId === item.productId)
  //   if(newItem){
  //       newItem.selectedVariants = [...newItem.selectedVariants, {variant: 'size', value: size}];
  //     this.wishlistItems = [...this.wishlistItems];
  //   }
  // }

  //   selectedColor(item: IWishlistItem, color: MultilingualText): void {
  //   const newItem = this.wishlistItems.find((i) => i.productId === item.productId)
  //   if(newItem){
  //     newItem.selectedVariants = [...newItem.selectedVariants, {variant: 'color', value: color}];
  //     this.wishlistItems = [...this.wishlistItems];
  //   }
  // }

  // View product details
  viewProduct(item: IWishlistItem): void {
    this.router.navigate(['/products', item.productId]);
  }
  

  // Track wishlist items by product and variant ID for efficient updates
  trackByItem(index: number, item: IWishlistItem): string {
    return `${item?.productId || 'unknown'}-${item?.variantId || 'none'}`;
  }

  // Check if an item is in stock
  isInStock(item: IWishlistItem): boolean {
    return (item?.product?.stock || 0) > 0;
  }

  // Get the price to display (discounted or regular)
  getDisplayPrice(item: IWishlistItem): number {
    return item?.product?.discountPrice || item?.product?.price || 0;
  }

  // Continue shopping
  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  // Get wishlist items with product details
  private loadWishlistProducts(): void {
    this.loading = true;
    this.wishlistService.wishlistState$.subscribe({
      next: (state: IWishlistState) => {
        this.wishlistItems = state.items;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading wishlist products:', error);
        this.loading = false;
      }
    });
  }

  // Clear entire wishlist
  clearWishlist(): void {
    this.loading = true;
    this.wishlistService.clearWishlist().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Wishlist has been cleared.'
        });
      },
      error: (error) => {
        console.error('Error clearing wishlist:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to clear wishlist. Please try again.'
        });
        this.loading = false;
      }
    });
  }

  // Get product image URL with fallback
  getProductImage(item: IWishlistItem): string {
    if (!item?.product?.images?.length) {
      return 'assets/images/placeholder-product.png';
    }
    const imagePath = item.product.images[0]?.filePath;
    return imagePath ? `${this.domain}${imagePath}` : 'assets/images/placeholder-product.png';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }
}
