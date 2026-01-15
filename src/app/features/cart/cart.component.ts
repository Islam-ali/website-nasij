import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, delay, finalize, map, take, takeUntil, tap } from 'rxjs/operators';

import { UiToastService, UiButtonComponent, UiSpinnerComponent, UiInputDirective } from '../../shared/ui';

// Services
import { CartService } from './services/cart.service';
import { PackageUrlService } from '../packages/services/package-url.service';
import { ProductUrlService } from '../products/services/product-url.service';
import { ICartItem, ICartState, ICartSummary } from './models/cart.interface';
import { environment } from '../../../environments/environment';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { CurrencyPipe } from '../../core/pipes/currency.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { ICountry, IState } from '../../core/models/location.interface';
import { FallbackImgDirective } from '../../core/directives';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MultiLanguagePipe,
    CurrencyPipe,
    TranslateModule,
    FallbackImgDirective
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
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
    private toastService: UiToastService,
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
      this.toastService.error('Failed to process item data from URL', 'Error');
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
      itemType: 'Package' as const,
      selectedVariants: packageData.selectedVariants || {}
    };

    this.cartService.addPackageToCart(packageItem).subscribe({
      next: (cartState) => {
        this.toastService.success('Package added to cart successfully', 'Success');
      },
      error: (error) => {
        this.toastService.error('Failed to add package to cart', 'Error');
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
      itemType: 'Product' as const
    };

    this.cartService.addToCart(productItem).subscribe({
      next: (cartState) => {
        this.toastService.success('Product added to cart successfully', 'Success');
      },
      error: (error) => {
        this.toastService.error('Failed to add product to cart', 'Error');
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
        this.toastService.error('Failed to load cart. Please try again.', 'Error');
        this.loading = false;
        return of(null);
      })
    ).subscribe();
  }



  onCheckout(): void {
    this.loading = true;
    // In a real app, you would validate the cart and then navigate to checkout
    this.router.navigate(['/checkout']).catch(error => {
      this.toastService.error('Failed to proceed to checkout. Please try again.', 'Error');
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
    
    if (event.country) {
      this.cartService.updateShippingLocation(event.country, event.state!).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Shipping cost updated', 'Updated');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to update shipping cost', 'Error');
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
    if (item.packageId && item.itemType === 'Package') {
      // Handle package update
      this.cartService.updateQuantity(undefined, newQuantity, item.packageId, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Package quantity updated successfully', 'Updated');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to update package quantity. Please try again.', 'Error');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'Product' || !item.itemType)) {
      // Handle product update
      this.cartService.updateQuantity(item.productId, newQuantity, item.packageId, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Product quantity updated successfully', 'Updated');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to update product quantity. Please try again.', 'Error');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else {
      this.loading = false;
    }
  }

  // Remove item from cart
  removeItem(item: ICartItem, index?: number): void {
    
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }
    
    this.loading = true;
    
    // Check if it's a package or product
    if (item.packageId) {
      // Handle package removal
      this.cartService.removeItem(item.productId, item.selectedVariants, item.packageId).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Package removed from cart', 'Removed');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to remove package. Please try again.', 'Error');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else if (item.productId && (item.itemType === 'Product' || !item.itemType)) {
      // Handle product removal
      this.cartService.removeItem(item.productId, item.selectedVariants).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Product removed from cart', 'Removed');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to remove product. Please try again.', 'Error');
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
        })
      ).subscribe();
    } else {
      // Fallback: remove by index if provided, otherwise find by matching properties
      if (index !== undefined && index >= 0) {
        this.cartService.removeItemByIndex(index).pipe(
          takeUntil(this.destroy$),
          tap(() => {
            this.toastService.success('Item removed from cart', 'Removed');
          }),
          catchError((error: any) => {
            this.toastService.error('Failed to remove item. Please try again.', 'Error');
            return of(null);
          }),
          finalize(() => {
            this.loading = false;
          })
        ).subscribe();
      } else {
        this.cartItems$.pipe(take(1)).subscribe(items => {
          const itemIndex = items.findIndex(cartItem => 
            cartItem === item || 
            (cartItem.productName?.en === item.productName?.en && 
             cartItem.price === item.price && 
             cartItem.quantity === item.quantity)
          );
          if (itemIndex !== -1) {
            this.cartService.removeItemByIndex(itemIndex).pipe(
              takeUntil(this.destroy$),
              tap(() => {
                this.toastService.success('Item removed from cart', 'Removed');
              }),
              catchError((error: any) => {
                this.toastService.error('Failed to remove item. Please try again.', 'Error');
                return of(null);
              }),
              finalize(() => {
                this.loading = false;
              })
            ).subscribe();
          } else {
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
        this.toastService.info('Your cart is already empty', 'Info');
        return;
      }

      if (!confirm('Are you sure you want to clear your cart?')) {
        return;
      }

      this.loading = true;
      this.cartService.clearCart().pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Your cart has been cleared', 'Cleared');
        }),
        catchError((error: any) => {
          this.toastService.error('Failed to clear cart. Please try again.', 'Error');
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
          this.toastService.success('Your voucher has been applied successfully!', 'Voucher Applied');
        } else {
          this.toastService.error('The voucher code you entered is invalid or has expired.', 'Invalid Voucher');
        }
      }),
      catchError((error: any) => {
        this.toastService.error('Failed to apply voucher. Please try again.', 'Error');
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
