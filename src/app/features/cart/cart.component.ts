import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, delay, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

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
import { PackageUrlService } from '../packages/services/package-url.service';
import { ProductUrlService } from '../products/services/product-url.service';
import { ICartItem, ICartState, ICartSummary } from './models/cart.interface';
import { environment } from '../../../environments/environment';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ICountry, IState } from '../../core/models/location.interface';

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
    MultiLanguagePipe,
    TranslateModule,
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
  cartItems = signal<ICartItem[]>([]);

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
    if (item.selectedVariants) parts.push(`Variant: ${item.selectedVariants.map(v => v.value.en || v.value).join(', ')}`);
    return parts.join(' | ');
  }
  
  // private getProductName(item: ICartItem): string {
  //   // Get product name or a default
  //   return item.product?.name || 'Unnamed Product';
  // }

  // Track items in ngFor for better performance
  trackByFn(index: number, item: ICartItem): string {
    return `${item.productId || item.packageId}-${index}`;
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
    private router: Router,
    private route: ActivatedRoute,
    private packageUrlService: PackageUrlService,
    private productUrlService: ProductUrlService
  ) {
    // Initialize observables
    this.cartState$ = this.cartService.cartState$
    this.cartSummary$ = this.cartState$.pipe(
      map(state => ({
        subtotal: state.summary?.subtotal || 0,
        shippingCost: state.summary?.shippingCost || 0,
        discount: state.summary?.discount || 0,
        itemsCount: state.summary?.itemsCount || 0,
        total: (state.summary?.subtotal || 0) + (state.summary?.shippingCost || 0) - (state.summary?.discount || 0)
      } as ICartSummary))
    );

      // Map cart items to include display properties and initialize cart items
    this.cartItems$ = this.cartService.getCartItems();
    
  }

  ngOnInit(): void {
    // Check for encoded data in query parameters
    this.route.queryParams.subscribe(queryParams => {
      this.handleEncodedData(queryParams);
    });

    // Load cart data when component initializes
    this.loadCart();
    
    // Subscribe to cart items to update signal
    this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems.set(items);
    });
  }

  private handleEncodedData(queryParams: any): void {
    try {
      // Check for encoded package data
      if (queryParams['addPackage']) {
        const encodedPackageData = this.packageUrlService.getPackageFromUrl({ package: queryParams['addPackage'] });
        if (encodedPackageData && encodedPackageData.data) {
          this.addEncodedPackageToCart(encodedPackageData.data);
        }
      }

      // Check for encoded product data
      if (queryParams['addProduct']) {
        const encodedProductData = this.productUrlService.getProductFromUrl({ product: queryParams['addProduct'] });
        if (encodedProductData && encodedProductData.data) {
          this.addEncodedProductToCart(encodedProductData.data);
        }
      }

      // Clear encoded data from URL after processing
      if (queryParams['addPackage'] || queryParams['addProduct']) {
        this.clearEncodedDataFromUrl();
      }
    } catch (error) {
      console.error('Error handling encoded data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process item data from URL'
      });
    }
  }

  private addEncodedPackageToCart(packageData: any): void {
    const packageItem = {
      packageId: packageData.packageId,
      quantity: packageData.quantity || 1,
      price: packageData.price,
      productName: packageData.productName,
      image: packageData.image,
      packageItems: packageData.packageItems || [],
      discount: packageData.discount || 0,
      itemType: 'package' as const,
      selectedVariants: packageData.selectedVariants || {}
    };

    this.cartService.addPackageToCart(packageItem).subscribe({
      next: (cartState) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Package added to cart successfully'
        });
      },
      error: (error) => {
        console.error('Error adding package to cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add package to cart'
        });
      }
    });
  }

  private addEncodedProductToCart(productData: any): void {
    const productItem = {
      productId: productData.productId,
      quantity: productData.quantity || 1,
      price: productData.price,
      productName: productData.productName,
      image: productData.image,
      selectedVariants: productData.selectedVariants || [],
      discount: productData.discount || 0,
      itemType: 'product' as const
    };

    this.cartService.addToCart(productItem).subscribe({
      next: (cartState) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product added to cart successfully'
        });
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add product to cart'
        });
      }
    });
  }

  private clearEncodedDataFromUrl(): void {
    const queryParams = { ...this.route.snapshot.queryParams };
    delete queryParams['addPackage'];
    delete queryParams['addProduct'];
    delete queryParams['source'];
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
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
          life: 1000,
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
        life: 1000,
      });
    }).finally(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle location change
  onLocationChange(event: { country: ICountry | null; state: IState | null; shippingCost: number }): void {
    console.log('🌍 Location changed:', event);
    
    if (event.country) {
      this.cartService.updateShippingLocation(event.country, event.state!).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Shipping cost updated',
            life: 1000,
          });
        }),
        catchError((error: any) => {
          console.error('Error updating shipping location:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update shipping cost',
            life: 1000,
          });
          return of(null);
        })
      ).subscribe();
    }
  }

  // Update item quantity
  updateQuantity(item: ICartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    this.loading = true;
    
    // Check if it's a package or product
    if (item.packageId && item.itemType === 'package') {
      // Handle package update
      this.cartService.updateQuantity(undefined, newQuantity, item.packageId, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Package quantity updated successfully',
            life: 1000,
          });
        }),
        catchError((error: any) => {
          console.error('Error updating package quantity:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update package quantity. Please try again.',
            life: 1000,
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'product' || !item.itemType)) {
      // Handle product update
      this.cartService.updateQuantity(item.productId, newQuantity, item.packageId, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Product quantity updated successfully',
            life: 1000,
          });
        }),
        catchError((error: any) => {
          console.error('Error updating product quantity:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update product quantity. Please try again.',
            life: 1000,
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else {
      console.error('Invalid item type for quantity update:', item);
      this.loading = false;
    }
  }

  // Remove item from cart
  removeItem(item: ICartItem, index?: number): void {
    console.log('🚨 CART COMPONENT removeItem CALLED!');
    console.log('🗑️ Cart component - removing item:', item);
    console.log('🗑️ Item has packageId:', !!item.packageId);
    console.log('🗑️ Item has productId:', !!item.productId);
    console.log('🗑️ Item type:', item.itemType);
    console.log('🗑️ Index:', index);
    console.log('🗑️ Item.packageId value:', item.packageId);
    console.log('🗑️ Item.packageId type:', typeof item.packageId);
    
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    this.loading = true;
    
    // Check if it's a package or product
    if (item.packageId) {
      console.log('📦 Removing package with ID:', item.packageId);
      console.log('📦 Item type:', item.itemType);
      console.log('📦 Full item data:', item);
      // Handle package removal
      this.cartService.removeItem(item.productId, item.selectedVariants, item.packageId).pipe(
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
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'product' || !item.itemType)) {
      console.log('🛍️ Removing product with ID:', item.productId);
      // Handle product removal
      this.cartService.removeItem(item.productId, item.selectedVariants).pipe(
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
          this.loading = false;
        })
      ).subscribe();
    } else {
      // Fallback: remove by index if provided, otherwise find by matching properties
      if (index !== undefined && index >= 0) {
        console.log('🔍 Removing by index:', index);
        this.cartService.removeItemByIndex(index).pipe(
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
            console.error('Error removing item by index:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove item. Please try again.',
              life: 1000,
            });
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        ).subscribe();
      } else {
        console.log('⚠️ IDs missing, removing by finding item in array');
        this.cartItems$.pipe(take(1)).subscribe(items => {
          const itemIndex = items.findIndex(cartItem => 
            cartItem === item || 
            (cartItem.productName?.en === item.productName?.en && 
             cartItem.price === item.price && 
             cartItem.quantity === item.quantity)
          );
          if (itemIndex !== -1) {
            console.log('🔍 Found item at index:', itemIndex);
            this.cartService.removeItemByIndex(itemIndex).pipe(
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
                console.error('Error removing item by index:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to remove item. Please try again.',
                  life: 1000,
                });
                return of(null);
              }),
              finalize(() => {
                this.loading = false;
              })
            ).subscribe();
          } else {
            console.error('Could not find item to remove:', item);
            this.loading = false;
          }
        });
      }
    }
  }


  // Clear entire cart
  clearCart(): void {
    this.cartItems$.pipe(take(1)).subscribe(items => {
      if (items.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Your cart is already empty',
          life: 1000,
        });
        return;
      }

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
            life: 1000
          });
        }),
        catchError((error: any) => {
          console.error('Error clearing cart:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to clear cart. Please try again.',
            life: 1000
          });
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    });
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
            life: 1000,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Invalid Voucher',
            detail: 'The voucher code you entered is invalid or has expired.',
            life: 1000,
          });
        }
      }),
      catchError((error: any) => {
        console.error('Error applying voucher:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to apply voucher. Please try again.',
          life: 1000,
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
