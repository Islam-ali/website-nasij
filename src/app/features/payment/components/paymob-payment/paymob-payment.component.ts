import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom, Subscription } from 'rxjs';
import { PaymobService, PaymentMethodType, WalletType } from '../../services/paymob.service';
import { CheckoutService } from '../../../checkout/services/checkout.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface PaymentParams {
  transactionId?: string;
  iframeUrl?: string;
  redirectUrl?: string;
  orderId?: string;
  amount?: string;
  currency?: string;
}

/**
 * Egyptian phone number validator
 * Must start with 01 and have exactly 11 digits
 */
function egyptianPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Let required validator handle empty values
  }
  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(control.value) ? null : { egyptianPhone: true };
}

@Component({
  selector: 'app-paymob-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './paymob-payment.component.html',
  styleUrls: ['./paymob-payment.component.scss']
})
export class PaymobPaymentComponent implements OnInit, OnDestroy {
  // Injected services
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly paymobService = inject(PaymobService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  // Payment method enum for template
  readonly PaymentMethodType = PaymentMethodType;
  readonly WalletType = WalletType;

  // Wallet type options for dropdown
  readonly walletTypes = [
    { value: WalletType.VODAFONE, label: 'Vodafone' },
    { value: WalletType.ORANGE, label: 'Orange' },
    { value: WalletType.ETISALAT, label: 'Etisalat' },
    { value: WalletType.WE, label: 'WE' },
  ];

  // State signals
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly iframeUrl = signal<SafeResourceUrl | null>(null);
  readonly redirectUrl = signal<string | null>(null);
  readonly orderId = signal<string | null>(null);
  readonly transactionId = signal<string | null>(null);
  readonly paymentMethod = signal<PaymentMethodType>(PaymentMethodType.CARD);

  // Payment form
  paymentForm: FormGroup;

  // Computed signals
  readonly hasError = computed(() => this.error() !== null);
  readonly canShowIframe = computed(() => 
    this.iframeUrl() !== null && !this.loading() && !this.hasError()
  );
  readonly isWalletPayment = computed(() => this.paymentMethod() === PaymentMethodType.WALLET);
  readonly isCardPayment = computed(() => this.paymentMethod() === PaymentMethodType.CARD);

  // Private state for cleanup
  private paymentWindow: Window | null = null;
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL_MS = 1000;
  private formSubscriptions = new Subscription();

  constructor() {
    // Initialize form
    this.paymentForm = this.fb.group({
      paymentMethod: [PaymentMethodType.CARD, [Validators.required]],
      orderId: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      phone_number: [''],
      wallet_type: [null],
    });

    // Watch payment method changes and update validators
    const paymentMethodSub = this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(value => {
      this.paymentMethod.set(value);
      this.updateWalletValidators(value);
    });
    if (paymentMethodSub) {
      this.formSubscriptions.add(paymentMethodSub);
    }
  }

  /**
   * Update wallet field validators based on payment method
   */
  private updateWalletValidators(method: PaymentMethodType): void {
    const phoneControl = this.paymentForm.get('phone_number');
    const walletTypeControl = this.paymentForm.get('wallet_type');

    if (method === PaymentMethodType.WALLET) {
      // Wallet payment: phone_number and wallet_type are required
      phoneControl?.setValidators([
        Validators.required,
        egyptianPhoneValidator
      ]);
      walletTypeControl?.setValidators([Validators.required]);
    } else {
      // Card payment: clear wallet validators
      phoneControl?.clearValidators();
      walletTypeControl?.clearValidators();
      phoneControl?.setValue('');
      walletTypeControl?.setValue(null);
    }

    phoneControl?.updateValueAndValidity({ emitEvent: false });
    walletTypeControl?.updateValueAndValidity({ emitEvent: false });
  }

  async ngOnInit(): Promise<void> {
    try {
      const params = await firstValueFrom(this.route.queryParams);
      await this.handlePaymentParams(params as PaymentParams);
    } catch (error) {
      console.error('Error reading query parameters:', error);
      this.setError('payment.missingParams');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.formSubscriptions.unsubscribe();
  }

  /**
   * Handle payment parameters from query string
   */
  private async handlePaymentParams(params: PaymentParams): Promise<void> {
    const { transactionId, iframeUrl: iframeUrlParam, redirectUrl: redirectUrlParam, orderId, amount, currency = 'EGP' } = params;

    // Case 1: If iframeUrl or redirectUrl is provided directly, use it immediately
    if (iframeUrlParam && transactionId) {
      this.setIframeUrl(iframeUrlParam, transactionId, orderId);
      return;
    }

    if (redirectUrlParam && transactionId) {
      this.setRedirectUrl(redirectUrlParam, transactionId, orderId);
      return;
    }

    // Case 2: If transactionId and orderId/amount are provided, populate form
    if (transactionId && orderId && amount) {
      this.transactionId.set(transactionId);
      this.paymentForm.patchValue({
        orderId,
        amount: parseFloat(amount),
      });
      this.orderId.set(orderId);
      this.loading.set(false);
      return;
    }

    // Case 3: Direct payment initiation with orderId and amount
    if (orderId && amount) {
      this.paymentForm.patchValue({
        orderId,
        amount: parseFloat(amount),
      });
      this.orderId.set(orderId);
      this.loading.set(false);
      return;
    }

    // Case 4: Missing required parameters
    this.setError('payment.missingParams');
    this.loading.set(false);
  }

  /**
   * Set iframe URL directly (when provided from query params)
   */
  private setIframeUrl(iframeUrlParam: string, transactionId: string, orderId?: string): void {
    try {
      const decodedUrl = decodeURIComponent(iframeUrlParam);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(decodedUrl);
      
      this.transactionId.set(transactionId);
      this.iframeUrl.set(safeUrl);
      if (orderId) {
        this.orderId.set(orderId);
      }
      this.loading.set(false);
    } catch (error) {
      console.error('Error setting iframe URL:', error);
      this.setError('payment.initiationFailed');
      this.loading.set(false);
    }
  }

  /**
   * Set redirect URL for wallet payments
   */
  private setRedirectUrl(redirectUrlParam: string, transactionId: string, orderId?: string): void {
    try {
      this.transactionId.set(transactionId);
      this.redirectUrl.set(redirectUrlParam);
      if (orderId) {
        this.orderId.set(orderId);
      }
      this.loading.set(false);
      // Redirect to Paymob payment page
      window.location.href = redirectUrlParam;
    } catch (error) {
      console.error('Error setting redirect URL:', error);
      this.setError('payment.initiationFailed');
      this.loading.set(false);
    }
  }

  /**
   * Submit payment form
   */
  async onSubmit(): Promise<void> {
    // Mark all fields as touched to show validation errors
    this.paymentForm.markAllAsTouched();

    // Check if form is valid
    if (this.paymentForm.invalid) {
      // Check for wallet validation errors
      if (this.isWalletPayment()) {
        const phoneControl = this.paymentForm.get('phone_number');
        const walletTypeControl = this.paymentForm.get('wallet_type');
        
        if (!phoneControl?.value || !walletTypeControl?.value) {
          this.setError('All wallet detail fields are mandatory');
          return;
        }

        if (phoneControl?.hasError('egyptianPhone')) {
          this.setError('Phone number must be in Egyptian format: starts with 01, length 11 digits');
          return;
        }
      }

      // General validation error
      this.setError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.paymentForm.value;
    const paymentMethod = formValue.paymentMethod as PaymentMethodType;

    // Additional validation for wallet payments
    if (paymentMethod === PaymentMethodType.WALLET) {
      if (!formValue.phone_number || !formValue.wallet_type) {
        this.setError('All wallet detail fields are mandatory');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^01[0-9]{9}$/;
      if (!phoneRegex.test(formValue.phone_number)) {
        this.setError('Phone number must be in Egyptian format: starts with 01, length 11 digits');
        return;
      }
    }

    // Prevent submission if validation fails
    if (this.paymentForm.invalid) {
      return;
    }

    await this.initiatePayment(
      formValue.orderId,
      formValue.amount,
      paymentMethod,
      formValue.phone_number,
      formValue.wallet_type
    );
  }

  /**
   * Initiate payment process
   */
  private async initiatePayment(
    orderId: string,
    amount: number,
    paymentMethod: PaymentMethodType,
    phone_number?: string,
    wallet_type?: WalletType
  ): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Validate orderId
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Validate wallet fields if payment method is wallet
      if (paymentMethod === PaymentMethodType.WALLET) {
        if (!phone_number || !wallet_type) {
          throw new Error('All wallet detail fields are mandatory');
        }

        // Validate phone number format
        const phoneRegex = /^01[0-9]{9}$/;
        if (!phoneRegex.test(phone_number)) {
          throw new Error('Phone number must be in Egyptian format: starts with 01, length 11 digits');
        }
      }

      // Convert amount to cents (Paymob expects amount in cents)
      const amountInCents = Math.round(amount * 100);

      // Get order details for customer information
      const customerInfo = await this.getCustomerInfo(orderId);

      // Prepare payment request
      const paymentRequest: any = {
        orderId,
        amount: amountInCents,
        paymentMethod,
        currency: 'EGP',
        ...customerInfo,
      };

      // Add wallet-specific fields only for wallet payments
      if (paymentMethod === PaymentMethodType.WALLET) {
        paymentRequest.phone_number = phone_number;
        paymentRequest.wallet_type = wallet_type;
      }

      // Initiate payment via PaymobService
      const response = await firstValueFrom(
        this.paymobService.initiatePayment(paymentRequest)
      );

      // Validate response
      if (!response?.transactionId) {
        throw new Error('Invalid response from payment service');
      }

      // Set transaction ID
      this.transactionId.set(response.transactionId);
      this.orderId.set(orderId);

      // Handle response based on payment method
      if (paymentMethod === PaymentMethodType.WALLET) {
        // Wallet payment: redirect to Paymob
        if (response.redirectUrl) {
          this.redirectUrl.set(response.redirectUrl);
          // Redirect to Paymob payment page
          window.location.href = response.redirectUrl;
        } else {
          throw new Error('Redirect URL not received for wallet payment');
        }
      } else {
        // Card payment: show iframe
        if (response.iframeUrl) {
          const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(response.iframeUrl);
          this.iframeUrl.set(safeUrl);
        } else {
          throw new Error('Iframe URL not received for card payment');
        }
      }

      this.loading.set(false);
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      const errorMessage = 
        error?.error?.message || 
        error?.message || 
        this.translate.instant('payment.initiationFailed') || 
        'Failed to initiate payment. Please try again.';
      this.setError(errorMessage);
      this.loading.set(false);
    }
  }

  /**
   * Get customer information from order
   */
  private async getCustomerInfo(orderId: string): Promise<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }> {
    try {
      const order = await firstValueFrom(this.checkoutService.getOrder(orderId));
      if (order?.shippingAddress) {
        const fullName = order.shippingAddress.fullName || '';
        const nameParts = fullName.split(' ');
        return {
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: order.shippingAddress.email || '',
          phoneNumber: order.shippingAddress.phone || '',
        };
      }
    } catch (error) {
      console.warn('Could not fetch order details:', error);
    }
    return {};
  }

  /**
   * Open payment iframe in a new window
   */
  openInNewWindow(): void {
    const url = this.iframeUrl();
    if (!url) {
      console.warn('No iframe URL available');
      return;
    }

    try {
      this.paymentWindow = window.open(
        url.toString(),
        'PaymobPayment',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!this.paymentWindow) {
        this.setError('Failed to open payment window. Please check your popup blocker settings.');
        return;
      }

      this.startWindowCloseCheck();
    } catch (error) {
      console.error('Error opening payment window:', error);
      this.setError('Failed to open payment window');
    }
  }

  /**
   * Start checking if payment window is closed
   */
  private startWindowCloseCheck(): void {
    this.stopWindowCloseCheck();

    this.checkInterval = window.setInterval(() => {
      if (this.paymentWindow?.closed) {
        this.stopWindowCloseCheck();
        this.checkPaymentStatus();
      }
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Stop checking window close status
   */
  private stopWindowCloseCheck(): void {
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check payment status after window is closed
   */
  private async checkPaymentStatus(): Promise<void> {
    const orderId = this.orderId();
    if (!orderId) {
      console.warn('No order ID available to check payment status');
      return;
    }

    try {
      const order = await firstValueFrom(this.checkoutService.getOrder(orderId));
      
      if (order?.paymentStatus === 'paid') {
        this.router.navigate(['/payment/success'], { 
          queryParams: { orderId } 
        });
      } else {
        this.router.navigate(['/payment/failure'], { 
          queryParams: { orderId } 
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      this.router.navigate(['/payment/failure'], { 
        queryParams: { orderId } 
      });
    }
  }

  /**
   * Retry payment initiation
   */
  async retry(): Promise<void> {
    this.error.set(null);
    const formValue = this.paymentForm.value;
    await this.initiatePayment(
      formValue.orderId,
      formValue.amount,
      formValue.paymentMethod,
      formValue.phone_number,
      formValue.wallet_type
    );
  }

  /**
   * Cancel payment and navigate back to checkout
   */
  cancel(): void {
    this.cleanup();
    this.router.navigate(['/checkout']);
  }

  /**
   * Set error message (supports translation keys or plain text)
   */
  private setError(errorKeyOrMessage: string): void {
    const translated = this.translate.instant(errorKeyOrMessage);
    this.error.set(
      translated !== errorKeyOrMessage ? translated : errorKeyOrMessage
    );
  }

  /**
   * Get form control error message
   */
  getFieldError(fieldName: string): string {
    const control = this.paymentForm.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control.hasError('egyptianPhone')) {
      return 'Phone number must be in Egyptian format: starts with 01, length 11 digits';
    }
    if (control.hasError('min')) {
      return 'Amount must be greater than 0';
    }

    return '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.paymentForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopWindowCloseCheck();

    if (this.paymentWindow && !this.paymentWindow.closed) {
      try {
        this.paymentWindow.close();
      } catch (error) {
        console.warn('Error closing payment window:', error);
      }
      this.paymentWindow = null;
    }
  }
}
