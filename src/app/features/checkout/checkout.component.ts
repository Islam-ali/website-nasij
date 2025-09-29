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
import { IArchived, OrderStatus } from '../../interfaces/product.interface';
import { ICountry } from '../../core/models/location.interface';
import { IState } from '../../core/models/location.interface';
import { MultiLanguagePipe } from '../../core/pipes/multi-language.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    ButtonModule,
    MultiLanguagePipe,
    TranslateModule
  ],
  providers: [MessageService, CheckoutService],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  loading = false;
  success = false;
  apiUrl = environment.apiUrl;

  // Cart items using signals
  cartItems = signal<ICartItem[]>([]);

  // Computed cart total
  cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + ((item.price - (item.discount || 0)) * item.quantity), 0);
  });

  // Shipping cost as signal
  shippingCost = signal(0);

  // Computed order total
  orderTotal = computed(() => {
    return this.cartTotal() + this.shippingCost();
  });

  // Signal to track payment method changes
  paymentMethod = signal<PaymentMethod>(PaymentMethod.CASH);

  // Computed property to check if payment image is required
  isPaymentImageRequired = computed(() => {
    const currentPaymentMethod = this.paymentMethod();
    console.log('Payment method:', currentPaymentMethod , 'Vodafone Cash:', PaymentMethod.VODAFONE_CASH);
    return currentPaymentMethod === PaymentMethod.VODAFONE_CASH;
  });

  // File upload properties
  selectedFile: File | null = null;
  paymentImagePreview: string | null = null;

  private destroy$ = new Subject<void>();

  // Form options
  countries = signal<ICountry[]>([]);

  states = signal<IState[]>([]);

  paymentMethods = [
    { label: 'Cash', value: PaymentMethod.CASH },
    { label: 'Vodafone Cash', value: PaymentMethod.VODAFONE_CASH },
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
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.checkoutForm = this.createCheckoutForm();
    
    // Subscribe to payment method changes
    this.checkoutForm.get('paymentMethod')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.paymentMethod.set(value);
    });
    
    this.loadCountries();
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
        const productName = params['productName'];
        const price = params['price'];
        const discount = params['discount'];
        const image = params['image'];
        this.cartItems.set([{
          productId: productId,
          quantity: quantity,
          selectedVariants: params['selectedVariants'] || [],
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
  loadCountries(): void {
    this.checkoutService.getCountries().subscribe({
      next: (countries: any) => {
        this.countries.set(countries.data);
        if (countries.data && countries.data.length > 0) {
          const firstCountry = countries.data[0];
          
          // Set first country as default in form
          this.checkoutForm.patchValue({
            shippingAddress: {
              ...this.checkoutForm.value.shippingAddress,
              country: firstCountry._id
            }
          });
          
          // Set shipping cost from first country
          this.shippingCost.set(firstCountry.defaultShippingCost || 0);
          
          // Load states for the first country
          this.loadStates();
          
          console.log('First country set:', firstCountry, 'Cost:', this.shippingCost(), 'Total:', this.orderTotal());
        } else {
          this.shippingCost.set(0);
          console.log('No countries available');
        }
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.shippingCost.set(0);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('checkout.validationErrors.fillAllFields')
        });
      }
    });
  }

  loadStates(): void {
    const countryId = this.checkoutForm.value.shippingAddress.country;
    this.checkoutService.getStates(countryId).subscribe((states: any) => {
      this.states.set(states.data);
      
      // // Reset shipping cost when country changes
      // this.shippingCost.set(0);
      
      // Clear state selection when country changes
      this.checkoutForm.patchValue({
        shippingAddress: {
          ...this.checkoutForm.value.shippingAddress,
          state: ''
        }
      });
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
      discount: productData.discount || 0,
      itemType: 'product' as const,
      selectedVariants: productData.selectedVariants || []
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
        country: ['', [Validators.required]]
      }),

      // Payment Details
      paymentMethod: [PaymentMethod.CASH],
      paymentImage: [''], // For Vodafone Cash screenshot

      // Order Notes
      notes: [''],

      // Terms & Conditions
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }


  // onShippingMethodChange(method: any): void {
  //   this.shippingCost = method.price || 0;
  //   // Recalculate order total when shipping method changes
  // }

  async onSubmit(): Promise<void> {
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
        summary: this.translate.instant('common.error'), 
        detail: this.translate.instant('checkout.validationErrors.fillAllFields') 
      });
      this.loading = false;
      return;
    }

    // Validate payment image for Vodafone Cash
    if (formValue.paymentMethod === PaymentMethod.VODAFONE_CASH && !this.selectedFile) {
      this.messageService.add({ 
        severity: 'error', 
        summary: this.translate.instant('common.error'), 
        detail: this.translate.instant('checkout.validationErrors.paymentImageRequired') 
      });
      this.loading = false;
      return;
    }

    // Validate cart items
    if (this.cartItems().length === 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: this.translate.instant('common.error'), 
        detail: this.translate.instant('checkout.validationErrors.cartEmpty') 
      });
      this.loading = false;
      return;
    }

    // Upload payment image if required
    let paymentImageUrl: string | null = null;
    if (formValue.paymentMethod === PaymentMethod.VODAFONE_CASH && this.selectedFile) {
      try {
        paymentImageUrl = await this.uploadPaymentImage();
        console.log('Payment image URL:', paymentImageUrl);
        debugger
        if (!paymentImageUrl) {
          this.loading = false;
          return;
        }
      } catch (error) {
        console.error('Payment image upload failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('checkout.validationErrors.uploadFailed')
        });
        this.loading = false;
        return;
      }
    }

    // Create order items using new structure
    const orderItems: IOrderItem[] = this.checkoutService.convertCartItemsToOrderItems(this.cartItems());

    // Get customer ID from auth service (optional)
    const currentUser = this.authService.currentUserValue;
    const customerId = currentUser?._id || undefined; // Don't use fallback, let it be undefined for guest orders
    console.log('Customer ID:', orderItems);
    debugger;
    // Create order data using backend DTO structure
    const orderData: ICreateOrder = {
      customerId: customerId, // This can be undefined for guest orders
      items: orderItems,
      status: OrderStatus.PENDING,
      
      // Additional fields from backend DTO
      subtotal: Number(this.cartTotal()),
      tax: this.calculateTax(),
      shippingCost: this.shippingCost(),
      discount: 0, // Can be calculated from coupons
      total: Number(this.orderTotal()),
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      paymentMethod: formValue.paymentMethod,
      cashPayment: {
        amountPaid: Number(this.shippingCost()),
        changeDue: Number(this.orderTotal()) - Number(this.shippingCost()),
        paymentImage: paymentImageUrl || '',
      },
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
        this.messageService.add({ 
          severity: 'success', 
          summary: this.translate.instant('common.success'), 
          detail: this.translate.instant('checkout.thankYou') 
        });
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
          summary: this.translate.instant('common.error'), 
          detail: errorMessage 
        });
      }
    });
  }
  setShippingCost(): void {
   const stateId = this.checkoutForm.value.shippingAddress.state;
   const countryId = this.checkoutForm.value.shippingAddress.country;
   
   if (stateId) {
     // Get shipping cost from state
     const state = this.states().find(state => state._id === stateId);
     if (state) {
       this.shippingCost.set(state.shippingCost || 0);
       console.log('Shipping cost updated from state:', state, 'Cost:', this.shippingCost(), 'Total:', this.orderTotal());
     }
   } else if (countryId) {
     // Get default shipping cost from country
     const country = this.countries().find(country => country._id === countryId);
     if (country) {
       this.shippingCost.set(country.defaultShippingCost || 0);
       console.log('Shipping cost updated from country:', country, 'Cost:', this.shippingCost(), 'Total:', this.orderTotal());
     }
   } else {
     this.shippingCost.set(0);
   }
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

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('checkout.validationErrors.invalidFileType')
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('checkout.validationErrors.fileTooLarge')
        });
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.paymentImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.paymentImagePreview = null;
    this.checkoutForm.patchValue({ paymentImage: '' });
  }

  onPaymentMethodChange(paymentMethod: PaymentMethod): void {
    this.paymentMethod.set(paymentMethod);
    // Clear payment image when switching away from Vodafone Cash
    if (paymentMethod !== PaymentMethod.VODAFONE_CASH) {
      this.removeSelectedFile();
    }
  }

  async uploadPaymentImage(): Promise<string | null> {
    if (!this.selectedFile) return null;

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('folderName', 'Uploads');
      formData.append('useCloudinary', 'true'); 
      
      // Upload to your file upload service
      const response = await fetch(`${this.apiUrl}/file-upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload result:', result);
      return result.data.filePath;
    } catch (error) {
      console.error('Upload error:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('checkout.validationErrors.uploadFailed')
      });
      return null;
    }
  }

  // Helper method to get shipping address form group
  get shippingAddress() {
    return (this.checkoutForm.get('shippingAddress') as FormGroup).controls;
  }

  // Helper method to get item text for cart
  getItemText(count: number): string {
    return count === 1 ? this.translate.instant('checkout.item') : this.translate.instant('checkout.items');
  }
}