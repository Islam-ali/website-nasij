# Checkout Shipping Cost Real-time Update

## Problem
The shipping cost was not updating the order total in real-time when the user changed the country or state selection in the checkout form.

## Root Cause
The `shippingCost` was a regular variable instead of a signal, which meant the computed `orderTotal` wouldn't react to changes.

## Solution

### 1. Converted shippingCost to Signal
```typescript
// Before
shippingCost = 0;

// After  
shippingCost = signal(0);
```

### 2. Updated Computed Order Total
```typescript
// Before
orderTotal = computed(() => {
  return this.cartTotal() + this.shippingCost; // ❌ Not reactive
});

// After
orderTotal = computed(() => {
  return this.cartTotal() + this.shippingCost(); // ✅ Reactive
});
```

### 3. Enhanced setShippingCost Method
```typescript
setShippingCost(): void {
  const stateId = this.checkoutForm.value.shippingAddress.state;
  const countryId = this.checkoutForm.value.shippingAddress.country;
  
  if (stateId) {
    // Get shipping cost from state
    const state = this.states().find(state => state._id === stateId);
    if (state) {
      this.shippingCost.set(state.shippingCost || 0);
    }
  } else if (countryId) {
    // Get default shipping cost from country
    const country = this.countries().find(country => country._id === countryId);
    if (country) {
      this.shippingCost.set(country.defaultShippingCost || 0);
    }
  } else {
    this.shippingCost.set(0);
  }
}
```

### 4. Updated loadStates Method
```typescript
loadStates(): void {
  const countryId = this.checkoutForm.value.shippingAddress.country;
  this.checkoutService.getStates(countryId).subscribe((states: any) => {
    this.states.set(states.data);
    
    // Reset shipping cost when country changes
    this.shippingCost.set(0);
    
    // Clear state selection when country changes
    this.checkoutForm.patchValue({
      shippingAddress: {
        ...this.checkoutForm.value.shippingAddress,
        state: ''
      }
    });
  });
}
```

### 5. Updated HTML Event Handlers
```html
<!-- Country change -->
<p-select [options]="countries()" 
          formControlName="country" 
          (onChange)="loadStates(); setShippingCost()">
</p-select>

<!-- State change -->
<p-select [options]="states()" 
          formControlName="state" 
          (onChange)="setShippingCost()">
</p-select>
```

### 6. Added Shipping Cost Display
```html
<div class="flex justify-between text-base text-gray-600 dark:text-gray-300">
  <span>Shipping</span>
  <span class="font-semibold">{{shippingCost() | currency}}</span>
</div>
<div *ngIf="shippingCost() > 0" class="text-xs text-gray-500 dark:text-gray-400 -mt-2">
  Based on selected location
</div>
```

## Features

### ✅ Real-time Updates
- Order total updates immediately when shipping location changes
- Shipping cost updates based on country default or state-specific rates

### ✅ Smart Cost Calculation
- Uses state-specific shipping cost when state is selected
- Falls back to country default shipping cost when only country is selected
- Resets to 0 when no location is selected

### ✅ User Experience
- Clear indication of shipping cost source ("Based on selected location")
- Automatic state clearing when country changes
- Real-time total calculation

### ✅ Data Flow
1. User selects country → Load states → Reset shipping cost → Update total
2. User selects state → Calculate shipping cost → Update total
3. All changes are reactive and immediate

## Files Modified
- `pledge-website/src/app/features/checkout/checkout.component.ts`
- `pledge-website/src/app/features/checkout/checkout.component.html`

### 7. Auto-set First Country
```typescript
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
      }
    }
  });
}
```

## Result
Shipping costs now update the order total in real-time, providing a smooth checkout experience with immediate feedback on shipping costs based on location selection. The first country is automatically selected when the checkout page loads, ensuring users always have a valid shipping location and cost.