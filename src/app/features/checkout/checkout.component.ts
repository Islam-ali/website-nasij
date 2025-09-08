import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntil, Subject } from 'rxjs';
import { ICartItem } from '../cart/models/cart.interface';
import { CartService } from '../cart/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { ICheckout } from './models/checkout';
import { AuthService } from '../auth/services/auth.service';
import { PackageUrlService } from '../packages/services/package-url.service';
import { ProductUrlService } from '../products/services/product-url.service';
import { environment } from '../../../environments/environment';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PaymentMethod, PaymentStatus, OrderItemType } from './models/order.enum';
import { ICreateOrder, IOrderItem, IShippingAddress } from './models/checkout';
import { OrderStatus } from '../../../../../pledge-dashbord/src/app/interfaces/order.interface';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ToastModule,
    ProgressSpinnerModule,
    SelectModule,
    InputTextModule,
    RadioButtonModule,
    CheckboxModule,
    ButtonModule
  ],
  providers: [MessageService, CheckoutService],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  loading = false;
  success = false;
  domain = environment.domain;

  // Cart items using signals
  cartItems = signal<ICartItem[]>([]);

  // Computed cart total
  cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  // Computed order total
  orderTotal = computed(() => {
    return this.cartTotal() + this.shippingCost;
  });

  shippingCost = 0;
  private destroy$ = new Subject<void>();

  // Form options
  countries = [
    { label: 'Select Country', value: null },
    { label: 'Egypt', value: 'EG' }
  ];

  states = [
    { label: 'Select State', value: null },
    { label: 'Cairo', value: 'Cairo' },
    { label: 'Giza', value: 'Giza' },
    { label: 'Alexandria', value: 'Alexandria' },
    { label: 'Mansoura', value: 'Mansoura' },
    { label: 'Port Said', value: 'Port Said' },
    { label: 'Tanta', value: 'Tanta' },
    { label: 'Ismailia', value: 'Ismailia' },
    { label: 'Sohag', value: 'Sohag' },
    { label: 'Qena', value: 'Qena' },
    { label: 'Asyut', value: 'Asyut' },
    { label: 'Beni Suef', value: 'Beni Suef' },
    { label: 'Fayoum', value: 'Fayoum' },
    { label: 'Minya', value: 'Minya' },
    { label: 'Suez', value: 'Suez' },
    { label: 'Luxor', value: 'Luxor' },
  ];

  paymentMethods = [
    { label: 'Cash', value: PaymentMethod.CASH },
    // { label: 'Credit Card', value: PaymentMethod.CREDIT_CARD },
    // { label: 'Bank Transfer', value: PaymentMethod.BANK_TRANSFER },
    // { label: 'PayPal', value: PaymentMethod.PAYPAL }
  ];
  isBuyNow = false;
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private messageService: MessageService,
    private packageUrlService: PackageUrlService,
    private productUrlService: ProductUrlService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkoutForm = this.createCheckoutForm();
    this.route.queryParams.subscribe(params => {
      // Check for encoded data first
      if (this.handleEncodedData(params)) {
        return;
      }

      // Legacy product handling
      if (params['productId']) {
        this.isBuyNow = true;
        const productId = params['productId'];
        const quantity = params['quantity'];
        const color = params['color'];
        const size = params['size'];
        const productName = params['productName'];
        const price = params['price'];
        const discount = params['discount'];
        const image = params['image'];
        this.cartItems.set([{
          productId: productId,
          quantity: quantity,
          color: color,
          size: size,
          productName: productName,
          price: price,
          discount: discount,
          image: image
        }]);
      } else {
        // Regular cart checkout
        this.cartService.cartState$.pipe(
          takeUntil(this.destroy$)
        ).subscribe((items: any) => {
          console.log('Cart state updated:', items);
          this.cartItems.set(items.items);
        });
        this.isBuyNow = false;
      }
    });
  }

  private handleEncodedData(params: any): boolean {
    try {
      // Check for encoded package data
      if (params['package']) {
        const encodedPackageData = this.packageUrlService.getPackageFromUrl(params);
        if (encodedPackageData && encodedPackageData.data) {
          this.handleEncodedPackage(encodedPackageData.data);
          return true;
        }
      }

      // Check for encoded product data
      if (params['product']) {
        const encodedProductData = this.productUrlService.getProductFromUrl(params);
        if (encodedProductData && encodedProductData.data) {
          this.handleEncodedProduct(encodedProductData.data);
          return true;
        }
      }

      // Check for encoded items data
      if (params['items']) {
        const encodedItemsData = this.packageUrlService.getItemsFromUrl(params);
        if (encodedItemsData && encodedItemsData.data) {
          this.handleEncodedItems(encodedItemsData.data);
          return true;
        }
      }

      // Check for encoded cart data
      if (params['cart']) {
        const encodedCartData = this.packageUrlService.getCartFromUrl(params);
        if (encodedCartData && encodedCartData.data) {
          this.handleEncodedCart(encodedCartData.data);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error handling encoded data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to process checkout data from URL'
      });
      return false;
    }
  }

  private handleEncodedPackage(packageData: any): void {
    this.isBuyNow = true;
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
    this.cartItems.set([packageItem]);
    console.log('Package item:', packageItem);
    console.log('Package items details:', packageData.packageItems);
  }

  private handleEncodedProduct(productData: any): void {
    this.isBuyNow = true;
    const productItem = {
      productId: productData.productId,
      quantity: productData.quantity || 1,
      price: productData.price,
      productName: productData.productName,
      image: productData.image,
      color: productData.color,
      size: productData.size,
      discount: productData.discount || 0,
      itemType: 'product' as const
    };
    this.cartItems.set([productItem]);
  }

  private handleEncodedItems(itemsData: any[]): void {
    this.isBuyNow = true;
    this.cartItems.set(itemsData);
  }

  private handleEncodedCart(cartData: any): void {
    this.isBuyNow = false;
    this.cartItems.set(cartData.items || []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createCheckoutForm(): FormGroup {
    return this.fb.group({
      // Billing Details
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required]],

      // Shipping Address
      shippingAddress: this.fb.group({
        address: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['EG', [Validators.required]]
      }),

      // Payment Details
      paymentMethod: [PaymentMethod.CASH],


      // Order Notes
      notes: [''],

      // Terms & Conditions
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }


  onShippingMethodChange(method: any): void {
    this.shippingCost = method.price || 0;
    // Recalculate order total when shipping method changes
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.loading) {
      console.log('Form is invalid:', this.checkoutForm.errors);
      console.log('Form values:', this.checkoutForm.value);
      return;
    }

    this.loading = true;

    const formValue = this.checkoutForm.value;
    console.log('Form value:', formValue);
    
    // Validate required fields
    if (!formValue.fullName || !formValue.phone || !formValue.shippingAddress.address || 
        !formValue.shippingAddress.city || !formValue.shippingAddress.state || !formValue.shippingAddress.country) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fill in all required fields.' 
      });
      this.loading = false;
      return;
    }

    // Validate cart items
    if (this.cartItems().length === 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Cart Empty', 
        detail: 'Your cart is empty. Please add items before checkout.' 
      });
      this.loading = false;
      return;
    }

    // Create order items using new structure
    const orderItems: IOrderItem[] = this.checkoutService.convertCartItemsToOrderItems(this.cartItems());

    // Get customer ID from auth service (optional)
    const currentUser = this.authService.currentUserValue;
    const customerId = currentUser?._id || undefined; // Don't use fallback, let it be undefined for guest orders

    // Create order data using backend DTO structure
    const orderData: ICreateOrder = {
      customerId: customerId, // This can be undefined for guest orders
      items: orderItems,
      totalPrice: Number(this.orderTotal()),
      status: OrderStatus.PENDING,
      
      // Additional fields from backend DTO
      subtotal: Number(this.cartTotal()),
      tax: this.calculateTax(),
      shippingCost: this.shippingCost,
      discount: 0, // Can be calculated from coupons
      total: Number(this.orderTotal()),
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      paymentMethod: formValue.paymentMethod,
      shippingAddress: {
        fullName: formValue.fullName,
        address: formValue.shippingAddress.address,
        city: formValue.shippingAddress.city,
        state: formValue.shippingAddress.state,
        country: formValue.shippingAddress.country,
        phone: formValue.phone
      },
      notes: formValue.notes || ''
    };

    
    console.log('Order data being sent:', JSON.stringify(orderData, null, 2));

    this.checkoutService.createOrder(orderData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        if (!this.isBuyNow) {
          this.cartService.clearCart().subscribe();
        }
        // Clear cart so all subscribers (Topbar, Cart page) update
        // window scroll to top
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
        }
        this.messageService.add({ severity: 'success', summary: 'Order Successful', detail: `Thank you for your purchase. Your order has been placed successfully.` });
        // Optionally redirect to order confirmation page
        // this.router.navigate(['/order-confirmation', response.orderId]);
      },
      error: (error: any) => {
        console.error('Order submission failed', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        let errorMessage = 'Failed to place order. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.loading = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Order Failed', 
          detail: errorMessage 
        });
      }
    });
  }

  public calculateTax(): number {
    // Simple tax calculation - in a real app, this would be more sophisticated
    // return this.cartTotal() * 0.1; // 10% tax
    return 0;
  }

  // Helper method to get form control
  get f() {
    return this.checkoutForm.controls;
  }

  // Helper method to get shipping address form group
  get shippingAddress() {
    return (this.checkoutForm.get('shippingAddress') as FormGroup).controls;
  }
}