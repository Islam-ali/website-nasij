import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntil, Subject } from 'rxjs';
import { ICartItem } from '../cart/models/cart.interface';
import { CartService } from '../cart/services/cart.service';
import { CheckoutService } from './services/checkout.service';
import { ICheckout } from './models/checkout';
import { environment } from '../../../environments/environment';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { OrderStatus, PaymentMethod, PaymentStatus } from './models/order.enum';

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
    { label: 'Cash', value: PaymentMethod.Cash },
    // { label: 'Credit Card', value: 'credit_card' },
    // { label: 'PayPal', value: 'paypal' }
  ];
  isBuyNow = false;
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.checkoutForm = this.createCheckoutForm();
    this.route.queryParams.subscribe(params => {
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
    }else{
      this.cartService.cartState$.pipe(
        takeUntil(this.destroy$)
      ).subscribe((items: any) => {
        console.log('Cart state updated:', items);
        this.cartItems.set(items.items);
      });
      this.isBuyNow = false;
    }
    });
    // Subscribe to cart state and update signal
    
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
      paymentMethod: [PaymentMethod.Cash], // Changed to null as PaymentMethod enum is removed


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

    const orderData: any = {
      items: this.cartItems().map(item => ({
        productId: item.productId, // This should be a valid MongoDB ObjectId string
        quantity: Number(item.quantity), // Ensure quantity is a number
        price: Number(item.price), // Ensure price is a number
        discountPrice: item.discount ? Number(item.discount) : 0,
        color: item.color || undefined,
        size: item.size || undefined
      })),
      subtotal: Number(this.cartTotal()),
      tax: Number(this.calculateTax()),
      shippingCost: Number(this.shippingCost),
      total: Number(this.orderTotal()),
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: formValue.paymentMethod,
      shippingAddress: {
        fullName: formValue.fullName,
        phone: formValue.phone.startsWith('+') ? formValue.phone : `+20${formValue.phone.replace(/^0/, '')}`, // Convert to E.164 format for Egypt
        address: formValue.shippingAddress.address,
        city: formValue.shippingAddress.city,
        state: formValue.shippingAddress.state,
        country: formValue.shippingAddress.country // Should be 'EG' for Egypt
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
        this.messageService.add({ severity: 'success', summary: 'Order Successful', detail: `Order ID: ${response.orderId}` });
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