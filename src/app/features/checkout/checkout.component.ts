import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckoutService } from './services/checkout.service';
import { ICheckout, Item } from './models/checkout';
// Import enums from the correct path in the frontend project
import { OrderStatus, PaymentMethod, PaymentStatus } from './models/order.enum';
import { SelectModule } from 'primeng/select';
import { ICartItem } from '../cart/models/cart.interface';
import { CartService } from '../cart/services/cart.service';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CheckboxModule,
    InputTextModule,
    // InputTextarea removed as it's not used in the template
    RadioButtonModule,
    SelectModule,
    ButtonModule,
  ],
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;
  orderId: string | null = null;
  domain = environment.domain;
  // Form options
  countries: SelectItem[] = [
    { label: 'Select Country', value: null },
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
    { label: 'Australia', value: 'AU' }
  ];
  states: SelectItem[] = [
    { label: 'Select State', value: null },
    { label: 'New York', value: 'NY' },
    { label: 'California', value: 'CA' },
    { label: 'Texas', value: 'TX' },
    { label: 'Florida', value: 'FL' }
  ];

  paymentMethods = [
    { label: 'Cash', value: 'cash' },
    // { label: 'Credit Card', value: 'credit_card' },
    // { label: 'PayPal', value: 'paypal' },
    // { label: 'Bank Transfer', value: 'bank_transfer' }
  ];

  shippingMethods: any[] = [];
  selectedShippingMethod: any;

  // Sample cart items - in a real app, this would come from a cart service
  cartItems$: BehaviorSubject<ICartItem[]> = new BehaviorSubject<ICartItem[]>([]);

  get cartTotal(): number {
    return this.cartItems$.value.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  get shippingCost(): number {
    return this.selectedShippingMethod?.price || 0;
  }

  get orderTotal(): number {
    return this.cartTotal + this.shippingCost;
  }

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private cartService: CartService
  ) {
    this.checkoutForm = this.createCheckoutForm();
    this.cartService.getCart().subscribe(items => {
      debugger
      this.cartItems$.next(items.items);
    });
  }

  ngOnInit(): void {
    // this.loadShippingMethods();
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

      
      // Order Notes
      notes: [''],
      
      // Terms & Conditions
      acceptTerms: [false, [Validators.requiredTrue]]
    });
  }


  onShippingMethodChange(method: any): void {
    this.selectedShippingMethod = method;
    // Recalculate order total when shipping method changes
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.checkoutForm.value;
    
    const orderData: ICheckout = {
      items: this.cartItems$.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
        discountPrice: item.discount,
        color: item.color,
        size: item.size
      })),
      subtotal: this.cartTotal,
      tax: this.calculateTax(),
      shippingCost: this.shippingCost,
      total: this.orderTotal,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: formValue.paymentMethod as PaymentMethod,
      shippingAddress: {
        fullName: formValue.fullName,
        phone: formValue.phone,
        street: formValue.shippingAddress.address,
        city: formValue.shippingAddress.city,
        state: formValue.shippingAddress.state,
        country: formValue.shippingAddress.country
      },
      notes: formValue.notes // Add empty notes field as required by ICheckout
    };

    this.checkoutService.createOrder(orderData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        this.orderId = response.orderId;
        // Optionally redirect to order confirmation page
        // this.router.navigate(['/order-confirmation', response.orderId]);
      },
      error: (error) => {
        console.error('Order submission failed', error);
        this.loading = false;
        this.error = 'Failed to place order. Please try again.';
      }
    });
  }

  public calculateTax(): number {
    // Simple tax calculation - in a real app, this would be more sophisticated
    return this.cartTotal * 0.1; // 10% tax
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