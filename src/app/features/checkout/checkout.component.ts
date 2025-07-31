import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule,
  FormsModule,
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { InputMaskModule } from 'primeng/inputmask';

import { AuthService } from '../auth/services/auth.service';
import { CartService } from '../cart/services/cart.service';
import { OrderService, CreateOrderDto } from '../orders/services/order.service';
import { ICartState, ICartItem } from '../cart/models/cart.interface';
import { Select } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';

// Extend ICartState to include missing properties
interface IExtendedCartState extends ICartState {
  subtotal: number;
  shipping: number;
  total: number;
  items: ICartItem[];
  discount?: number;
}

// Define the structure of the checkout form
interface ICheckoutForm {
  email: string;
  phone: string;
  shippingName: string;
  shippingAddress: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: any;
  sameAsBilling: boolean;
  billingName: string;
  billingAddress: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: any;
  paymentMethod: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  notes: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    InputMaskModule,
    Select,
    RadioButtonModule,
    ToastModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  loading = false;
  submitted = false;
  sameBillingAddress = true;
  cart: IExtendedCartState = {
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
    discount: 0,
    summary: {
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      itemsCount: 0
    }
  };
  
  paymentMethods = [
    { label: 'Credit Card', value: 'credit_card' },
    { label: 'PayPal', value: 'paypal' },
    { label: 'Bank Transfer', value: 'bank_transfer' }
  ];
  
  countries = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Australia', code: 'AU' }
  ];
  
  private cartSubscription: Subscription | null = null;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cartState$.subscribe({
      next: (cart) => {
        if (cart) {
          const subtotal = cart.summary?.subtotal || 0;
          const shipping = cart.summary?.shipping || 0;
          
          this.cart = {
            ...cart,
            items: cart.items || [],
            subtotal,
            shipping,
            total: subtotal + shipping
          };
          
          // Redirect to cart if empty
          if ((cart.items || []).length === 0) {
            this.router.navigate(['/cart']);
          }
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load cart. Please try again.'
        });
      }
    });

    // Set initial form values
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const userData: Partial<ICheckoutForm> = {
        email: currentUser.email || '',
        phone: (currentUser as any).phone || '',
        shippingName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        billingName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
      };
      
      this.checkoutForm.patchValue(userData);
    }

    // Update credit card validations based on payment method
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const cardNumber = this.checkoutForm.get('cardNumber');
      const cardName = this.checkoutForm.get('cardName');
      const cardExpiry = this.checkoutForm.get('cardExpiry');
      const cardCvv = this.checkoutForm.get('cardCvv');

      if (method === 'credit_card') {
        cardNumber?.setValidators([Validators.required, this.validateLuhn]);
        cardName?.setValidators([Validators.required]);
        cardExpiry?.setValidators([Validators.required, this.validateCardExpiry]);
        cardCvv?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(4)]);
      } else {
        cardNumber?.clearValidators();
        cardName?.clearValidators();
        cardExpiry?.clearValidators();
        cardCvv?.clearValidators();
      }
      
      cardNumber?.updateValueAndValidity();
      cardName?.updateValueAndValidity();
      cardExpiry?.updateValueAndValidity();
      cardCvv?.updateValueAndValidity();
    });

    // Handle same as billing address toggle
    this.checkoutForm.get('sameAsBilling')?.valueChanges.subscribe(checked => {
      this.sameBillingAddress = checked;
      this.updateBillingAddress(checked);
    });
  }

  private initializeForm(): void {
    this.checkoutForm = this.fb.group({
      // Contact Information
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phone: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9\-+\s()]{10,20}$/)
      ]],
      
      // Shipping Address
      shippingName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      shippingAddress: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      shippingAddress2: ['', [
        Validators.maxLength(200)
      ]],
      shippingCity: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      shippingState: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      shippingZip: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{5}(-[0-9]{4})?$/)
      ]],
      shippingCountry: [null, [Validators.required]],
      
      // Billing Address
      sameAsBilling: [true],
      billingName: [''],
      billingAddress: [''],
      billingAddress2: [''],
      billingCity: [''],
      billingState: [''],
      billingZip: [''],
      billingCountry: [null],
      
      // Payment
      paymentMethod: ['credit_card', [Validators.required]],
      cardNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{13,19}$/),
        this.validateLuhn
      ]],
      cardName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      cardExpiry: ['', [
        Validators.required, 
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
        this.validateCardExpiry
      ]],
      cardCvv: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{3,4}$/)
      ]],
      
      // Additional
      notes: ['', [
        Validators.maxLength(500)
      ]],
      termsAccepted: [false, [
        Validators.requiredTrue
      ]],
      marketingOptIn: [false]
    }, {
      validators: [
        this.validateBillingAddress,
        this.validateCardExpiry
      ]
    });
  }

  private updateBillingAddress(sameAsShipping: boolean): void {
    if (sameAsShipping) {
      const shippingAddress = {
        billingName: this.checkoutForm.get('shippingName')?.value,
        billingAddress: this.checkoutForm.get('shippingAddress')?.value,
        billingAddress2: this.checkoutForm.get('shippingAddress2')?.value,
        billingCity: this.checkoutForm.get('shippingCity')?.value,
        billingState: this.checkoutForm.get('shippingState')?.value,
        billingZip: this.checkoutForm.get('shippingZip')?.value,
        billingCountry: this.checkoutForm.get('shippingCountry')?.value
      };
      this.checkoutForm.patchValue(shippingAddress);
    }
  }

  // Custom validator for Luhn algorithm (credit card number validation)
  private validateLuhn(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    
    // Remove all non-digit characters
    const value = control.value.replace(/\D/g, '');
    
    // Accept only digits, dashes or spaces
    if (/[^0-9-\s]+/.test(control.value)) {
      return { invalidChars: true };
    }
    
    // The Luhn Algorithm
    let nCheck = 0, nDigit = 0, bEven = false;
    
    for (let n = value.length - 1; n >= 0; n--) {
      const cDigit = value.charAt(n);
      nDigit = parseInt(cDigit, 10);
      
      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }
      
      nCheck += nDigit;
      bEven = !bEven;
    }
    
    return (nCheck % 10) === 0 ? null : { invalidCardNumber: true };
  }
  
  // Custom validator for card expiry date
  private validateCardExpiry(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    
    const [month, year] = control.value.split('/').map(Number);
    if (!month || !year) {
      return { invalidExpiry: true };
    }
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { cardExpired: true };
    }
    
    return null;
  }
  
  // Custom validator for billing address
  private validateBillingAddress(control: AbstractControl): ValidationErrors | null {
    const sameAsBilling = control.get('sameAsBilling')?.value;
    
    if (sameAsBilling) {
      return null;
    }
    
    const billingName = control.get('billingName')?.value;
    const billingAddress = control.get('billingAddress')?.value;
    const billingCity = control.get('billingCity')?.value;
    const billingState = control.get('billingState')?.value;
    const billingZip = control.get('billingZip')?.value;
    const billingCountry = control.get('billingCountry')?.value;
    
    if (!billingName || !billingAddress || !billingCity || !billingState || !billingZip || !billingCountry) {
      return { billingIncomplete: true };
    }
    
    return null;
  }

  // Form controls getter for template
  get f() { return this.checkoutForm.controls; }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    
    // Validate form and cart
    if (this.checkoutForm.invalid) {
      this.scrollToFirstInvalidControl();
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Incomplete',
        detail: 'Please fill in all required fields correctly.',
        life: 5000
      });
      return;
    }

    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Cart',
        detail: 'Your cart is empty. Please add items before checking out.',
        life: 5000
      });
      this.router.navigate(['/cart']);
      return;
    }

    try {
      // Show confirmation dialog
      const confirmed = await this.showConfirmationDialog();
      if (!confirmed) {
        return;
      }

      this.loading = true;
      
      // Prepare order data with proper typing
      const formValue = this.checkoutForm.getRawValue() as ICheckoutForm;
      const orderData: CreateOrderDto = {
        items: (this.cart.items || []).map(item => ({
          productId: item.productId,
          price: item.price || 0,
          quantity: item.quantity || 1,
          color: item.color,
          size: item.size,
          
        })),
        subtotal: this.cart.subtotal,
        shipping: this.cart.shipping,
        total: this.cart.total,
        shippingAddress: {
          name: formValue.shippingName,
          street: formValue.shippingAddress,
          city: formValue.shippingCity,
          state: formValue.shippingState,
          zip: formValue.shippingZip,
          country: formValue.shippingCountry?.name || formValue.shippingCountry
        },
        billingAddress: formValue.sameAsBilling ? null : {
          name: formValue.billingName,
          street: formValue.billingAddress,
          city: formValue.billingCity,
          state: formValue.billingState,
          zip: formValue.billingZip,
          country: formValue.billingCountry?.name || formValue.billingCountry
        },
        paymentMethod: formValue.paymentMethod,
        ...(formValue.paymentMethod === 'credit_card' && {
          cardType: this.getCardType(formValue.cardNumber),
          last4: formValue.cardNumber?.replace(/\D/g, '').slice(-4),
          expiry: formValue.cardExpiry
        }),
        notes: formValue.notes,
      };

      // Submit order
      const order = await firstValueFrom(this.orderService.createOrder(orderData));
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Order Placed!',
        detail: 'Your order has been placed successfully',
        life: 5000
      });
      
      // Clear cart
      this.cartService.clearCart();
      
      // Navigate to order confirmation
      this.router.navigate(['/order-confirmation', order.orderNumber]);
      
    } catch (error: any) {
      console.error('Error processing order:', error);
      
      let errorMessage = 'There was an error processing your order. Please try again.';
      
      // Handle specific error cases
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        this.authService.logout();
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 7000
      });
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      this.loading = false;
    }
  }

  private scrollToFirstInvalidControl(): void {
    const firstInvalidControl = document.querySelector('.ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Focus the first invalid input after scrolling
      const input = firstInvalidControl.querySelector('input, select, textarea') as HTMLElement;
      if (input) {
        setTimeout(() => {
          input.focus();
          
          // If it's a PrimeNG dropdown, open it
          if (input.classList.contains('p-dropdown-label')) {
            const dropdown = input.closest('p-dropdown');
            if (dropdown) {
              (dropdown as any).show();
            }
          }
        }, 100);
      }
    }
  }

  private showConfirmationDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: `Please review your order before confirming. Total amount: $${(this.cart?.total || 0).toFixed(2)}`,
        header: 'Confirm Order',
        icon: 'pi pi-shopping-cart',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-text',
        acceptLabel: 'Place Order',
        rejectLabel: 'Review Order',
        defaultFocus: 'reject',
        closeOnEscape: true,
        dismissableMask: true,
        accept: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Processing',
            detail: 'Processing your order...',
            life: 3000
          });
          resolve(true);
        },
        reject: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Review',
            detail: 'Please review your order details',
            life: 3000
          });
          resolve(false);
        }
      });
    });
  }

  private getCardType(cardNumber: string): string {
    if (!cardNumber) return 'unknown';
    
    // Visa
    if (/^4/.test(cardNumber)) return 'visa';
    
    // Mastercard
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    
    // American Express
    if (/^3[47]/.test(cardNumber)) return 'amex';
    
    // Discover
    if (/^6(?:011|5)/.test(cardNumber)) return 'discover';
    
    return 'unknown';
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Update the input value
    input.value = value.trim();
    
    // Update the form control
    this.checkoutForm.get('cardNumber')?.setValue(value.trim(), { emitEvent: false });
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 4 digits (MMYY)
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    
    // Add slash after MM
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    
    // Update the input value
    input.value = value;
    
    // Update the form control
    this.checkoutForm.get('cardExpiry')?.setValue(value, { emitEvent: false });
  }

  onConfirmOrder(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to place this order?',
      header: 'Confirm Order',
      icon: 'pi pi-shopping-cart',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      defaultFocus: 'reject',
      closeOnEscape: true,
      dismissableMask: true,
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Processing',
          detail: 'Processing your order...',
          life: 3000
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Review',
          detail: 'Please review your order details',
          life: 3000
        });
      }
    });
  }

  onRejectOrder(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Review',
      detail: 'Please review your order details',
      life: 3000
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    this.messageService.clear();
  }
}
