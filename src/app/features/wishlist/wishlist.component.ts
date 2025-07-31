import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
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
  wishlistState$: Observable<IWishlistState>;
  loading = false;
  private subscriptions = new Subscription();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.wishlistState$ = this.wishlistService.wishlistState$;
  }

  ngOnInit(): void {
    // In a real app, you might want to load additional product details here
    // this.loadWishlistProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Remove item from wishlist
  removeFromWishlist(item: IWishlistItem): void {
    this.loading = true;
    this.subscriptions.add(
      this.wishlistService
        .removeFromWishlist(item.productId, item.variantId)
        .subscribe({
          next: () => {
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
        })
    );
  }

  // Move item to cart
  moveToCart(item: IWishlistItem): void {
    this.loading = true;
    
    // In a real app, you would get the product details first
    // Then add the selected variant to cart
    const cartItem = {
      productId: item.productId,
      variantId: item.variantId,
      name: item.product?.name || 'Product',
      price: item.product?.price || 0,
      image: item.product?.images?.[0],
      quantity: 1
    };
    
    this.subscriptions.add(
      this.cartService.addToCart(cartItem).subscribe({
        next: () => {
          // Remove from wishlist after adding to cart
          this.wishlistService.removeFromWishlist(item.productId, item.variantId).subscribe({
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
      })
    );
  }

  // View product details
  viewProduct(item: IWishlistItem): void {
    if (item.product) {
      this.router.navigate(['/products', item.productId]);
    } else {
      // If product details aren't loaded, just navigate with ID
      this.router.navigate(['/products', item.productId]);
    }
  }

  // Clear entire wishlist
  clearWishlist(): void {
    this.loading = true;
    this.subscriptions.add(
      this.wishlistService.clearWishlist().subscribe({
        next: () => {
          this.loading = false;
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
      })
    );
  }
  
  // Continue shopping
  continueShopping(): void {
    this.router.navigate(['/products']);
  }
  
  // Track items for ngFor
  trackByItem(index: number, item: IWishlistItem): string {
    return `${item.productId}-${item.variantId || 'no-variant'}`;
  }
}
