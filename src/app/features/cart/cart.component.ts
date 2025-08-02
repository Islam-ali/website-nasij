import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, delay, finalize, map, takeUntil, tap } from 'rxjs/operators';
import { IArchived, IProduct } from '../../interfaces/product.interface';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';

// Services
import { CartService } from './services/cart.service';
import { ICartItem, ICartState, ICartSummary } from './models/cart.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
    ToastModule,
    MessageModule,
    MessagesModule,
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  providers: [MessageService, CartService]
})
export class CartComponent implements OnInit, OnDestroy {
  // Component state
  loading = false;
  voucherCode = '';
  showVoucherInput = false;
  private destroy$ = new Subject<void>();
  domain = environment.domain;
  // Cart state and summary
  cartState$: Observable<ICartState>;
  cartSummary$: Observable<ICartSummary>;
  cartItems$: Observable<ICartItem[]>;

  // Helper methods for display properties
  // private getProductImageUrl(item: ICartItem): string {
  //   // Use product image if available, otherwise use a placeholder
  //   const firstImage = item.product?.images?.[0] as { filePath: string } | undefined;
  //   return firstImage?.filePath || 'assets/images/placeholder-product.jpg';
  // }

  // private getCategoryName(item: ICartItem): string {
  //   // Get category name from product or use a default
  //   return item.product?.category?.name || 'Uncategorized';
  // }

  private getVariantName(item: ICartItem): string {
    // Combine color and size if available
    const parts = [];
    if (item.color) parts.push(`Color: ${item.color}`);
    if (item.size) parts.push(`Size: ${item.size}`);
    return parts.join(' | ');
  }
  
  // private getProductName(item: ICartItem): string {
  //   // Get product name or a default
  //   return item.product?.name || 'Unnamed Product';
  // }

  // Track items in ngFor for better performance
  trackByFn(index: number, item: ICartItem): string {
    return `${item.productId}-${'color' in item ? item.color : ''}-${'size' in item ? item.size : ''}`;
  }

  // Helper to safely cast ICartItem to CartItemDisplay
  // private toCartItemDisplay(item: ICartItem): CartItemDisplay {
  //   return {
  //     ...item,
  //     name: this.getProductName(item),
  //     imageUrl: this.getProductImageUrl(item),
  //     categoryName: this.getCategoryName(item),
  //     variantName: this.getVariantName(item),
  //     price: item.price || 0,
  //     quantity: item.quantity || 1
  //   } as CartItemDisplay;
  // }



  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Initialize observables
    this.cartState$ = this.cartService.cartState$
    this.cartSummary$ = this.cartState$.pipe(
      map(state => ({
        subtotal: state.summary?.subtotal || 0,
        shipping: state.summary?.shipping || 0,
        discount: state.summary?.discount || 0,
        itemsCount: state.summary?.itemsCount || 0,
        total: (state.summary?.subtotal || 0) + (state.summary?.shipping || 0) - (state.summary?.discount || 0)
      } as ICartSummary))
    );

      // Map cart items to include display properties and initialize cart items
    this.cartItems$ = this.cartService.getCartItems();
    
  }

  ngOnInit(): void {
    // Load cart data when component initializes
    this.loadCart();
  }





  private loadCart(): void {
    this.loading = true;
    this.cartService.getCart().pipe(
      takeUntil(this.destroy$),
      tap(() => 
        this.loading = false
    ),
      catchError((error: any) => {
        console.error('Error loading cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cart. Please try again.',
          life: 5000,
        });
        this.loading = false;
        return of(null);
      })
    ).subscribe();
  }



  onCheckout(): void {
    this.loading = true;
    // In a real app, you would validate the cart and then navigate to checkout
    this.router.navigate(['/checkout']).catch(error => {
      console.error('Navigation error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to proceed to checkout. Please try again.',
        life: 5000,
      });
    }).finally(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Update item quantity
  updateQuantity(item: ICartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.loading = true;
    this.cartService.updateQuantity(item.productId, newQuantity, item.color, item.size).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'Quantity updated successfully',
          life: 3000,
        });
      }),
      catchError((error: any) => {
        console.error('Error updating quantity:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update quantity. Please try again.',
          life: 5000,
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  // Remove item from cart
  removeItem(item: ICartItem): void {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    this.loading = true;
    this.cartService.removeItem(item.productId, item.color, item.size).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Removed',
          detail: 'Item removed from cart',
          life: 3000,
        });
      }),
      catchError((error: any) => {
        console.error('Error removing item:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove item. Please try again.',
          life: 5000,
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  // Clear entire cart
  clearCart(): void {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    this.loading = true;
    this.cartService.clearCart().pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cleared',
          detail: 'Your cart has been cleared',
          life: 3000
        });
      }),
      catchError((error: any) => {
        console.error('Error clearing cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to clear cart. Please try again.',
          life: 5000
        });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe();
  }

  applyVoucher(): void {
    if (!this.voucherCode.trim()) return;

    this.loading = true;
    // TODO: Implement voucher functionality in CartService
    of(true).pipe(
      delay(1000),
      takeUntil(this.destroy$),
      tap((isValid) => {
        if (isValid) {
          this.messageService.add({
            severity: 'success',
            summary: 'Voucher Applied',
            detail: 'Your voucher has been applied successfully!',
            life: 5000,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Voucher',
            detail: 'The voucher code you entered is invalid or has expired.',
            life: 5000,
          });
        }
      }),
      catchError((error: any) => {
        console.error('Error applying voucher:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to apply voucher. Please try again.',
          life: 5000,
        });
        return of(false);
      }),
      finalize(() => {
        this.loading = false;
        this.voucherCode = '';
      })
    ).subscribe();
  }

  // Apply voucher code
  applyVoucherCode(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.applyVoucher();
  }

  // Navigate to checkout
  proceedToCheckout(): void {
    this.router.navigate(["/checkout"])
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement
    img.src = "/placeholder.svg?height=140&width=140" // Fallback placeholder
  }

  // Toggle coupon code input
  toggleCouponInput(): void {
    this.showVoucherInput = !this.showVoucherInput
  }

  // Navigate to product details
  goToProduct(productId: string): void {
    this.router.navigate(["/products", productId])
  }

  // Continue shopping - go back to products page
  continueShopping(): void {
    this.router.navigate(["/products"])
  }
}
