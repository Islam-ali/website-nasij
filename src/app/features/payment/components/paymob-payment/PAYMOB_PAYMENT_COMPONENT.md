# Paymob Payment Component

A standalone Angular component for Paymob payment integration with modern Angular patterns.

## Features

✅ **Angular 17+ Signals** - Uses signals for reactive state management  
✅ **No Subscription Leaks** - Uses `firstValueFrom` instead of subscriptions  
✅ **Memory Safe** - Proper cleanup in `ngOnDestroy`  
✅ **Error Handling** - Comprehensive error handling with user-friendly messages  
✅ **Translation Support** - Full i18n support via `ngx-translate`  
✅ **Accessibility** - ARIA labels and semantic HTML  
✅ **Type Safety** - Full TypeScript typing  

## Usage

### Route Configuration

```typescript
{
  path: 'payment/paymob',
  component: PaymobPaymentComponent
}
```

### Query Parameters

The component accepts the following query parameters:

- `transactionId` (optional): Transaction ID if payment already initiated
- `iframeUrl` (optional): Direct iframe URL (encoded) if available
- `orderId` (required if no iframeUrl): Order ID for payment
- `amount` (required if no iframeUrl): Payment amount
- `currency` (optional): Currency code (default: 'EGP')

### Example Routes

```typescript
// Direct iframe URL (fastest)
router.navigate(['/payment/paymob'], {
  queryParams: {
    transactionId: '123',
    iframeUrl: encodeURIComponent('https://accept.paymob.com/...'),
    orderId: '456'
  }
});

// Initiate payment with order ID
router.navigate(['/payment/paymob'], {
  queryParams: {
    orderId: '456',
    amount: 230,
    currency: 'EGP'
  }
});
```

## Component Architecture

### State Management

Uses Angular signals for reactive state:

```typescript
loading = signal<boolean>(true);
error = signal<string | null>(null);
iframeUrl = signal<SafeResourceUrl | null>(null);
orderId = signal<string | null>(null);
transactionId = signal<string | null>(null);
```

### Computed Signals

```typescript
hasError = computed(() => this.error() !== null);
canShowIframe = computed(() => 
  this.iframeUrl() !== null && !this.loading() && !this.hasError()
);
```

### Lifecycle

1. **ngOnInit**: Reads query params once using `firstValueFrom`
2. **handlePaymentParams**: Determines payment flow based on params
3. **initiatePayment**: Calls PaymobService to start payment
4. **ngOnDestroy**: Cleans up intervals and closes windows

## Payment Flow

### Flow 1: Direct Iframe URL
```
Query Params → Set iframe URL → Display iframe
```

### Flow 2: Initiate Payment
```
Query Params → Get Order Info → Call PaymobService → Set iframe URL → Display iframe
```

## Methods

### Public Methods

- `openInNewWindow()`: Opens payment iframe in popup window
- `retry()`: Retries payment initiation
- `cancel()`: Cancels payment and navigates to checkout

### Private Methods

- `handlePaymentParams()`: Processes query parameters
- `initiatePayment()`: Initiates payment via PaymobService
- `getCustomerInfo()`: Fetches customer info from order
- `checkPaymentStatus()`: Verifies payment after window close
- `cleanup()`: Cleans up resources

## Error Handling

Errors are handled at multiple levels:

1. **Query Parameter Errors**: Missing required params
2. **API Errors**: Payment initiation failures
3. **Window Errors**: Popup blocker issues
4. **Status Check Errors**: Payment verification failures

All errors are translated and displayed to the user.

## Memory Management

### Cleanup on Destroy

```typescript
ngOnDestroy(): void {
  // Stop interval checking
  this.stopWindowCloseCheck();
  
  // Close payment window
  if (this.paymentWindow && !this.paymentWindow.closed) {
    this.paymentWindow.close();
  }
}
```

### No Subscription Leaks

- Uses `firstValueFrom` instead of `subscribe()`
- No need to unsubscribe
- Automatic cleanup

## Translation Keys

Required translation keys in `en.json` and `ar.json`:

```json
{
  "payment": {
    "title": "Complete Your Payment",
    "subtitle": "You will be redirected to Paymob secure payment page",
    "processing": "Processing your payment...",
    "error": "Payment Error",
    "retry": "Try Again",
    "cancel": "Cancel",
    "openNewWindow": "Open in New Window",
    "cancelPayment": "Cancel Payment",
    "missingParams": "Missing order ID or amount",
    "initiationFailed": "Failed to initiate payment. Please try again."
  }
}
```

## Dependencies

- `@angular/core`: Signals, lifecycle hooks
- `@angular/router`: Navigation
- `@angular/platform-browser`: DomSanitizer
- `rxjs`: firstValueFrom
- `@ngx-translate/core`: Translation support

## Services Required

- `PaymobService`: Payment initiation
- `CheckoutService`: Order information

## Browser Compatibility

- Modern browsers with ES2020+ support
- Requires popup support for new window feature
- Works with popup blockers (shows error message)

## Testing Considerations

- Mock `PaymobService` and `CheckoutService`
- Test query parameter handling
- Test error scenarios
- Test window management
- Test cleanup on destroy


