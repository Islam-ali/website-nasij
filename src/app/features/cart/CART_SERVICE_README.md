# Cart Service - Products & Packages Support

## Overview

The Cart Service has been enhanced to support both individual products and packages, providing a unified shopping cart experience for customers.

## Features

### ✅ Supported Features

#### 1. **Product Management**
- Add individual products to cart
- Update product quantities
- Remove products from cart
- Support for product variants (color, size)

#### 2. **Package Management**
- Add packages to cart
- Update package quantities
- Remove packages from cart
- Support for package items with variants

#### 3. **Mixed Cart Support**
- Cart can contain both products and packages
- Unified cart state management
- Consistent API for all item types

#### 4. **Persistence**
- Cart state saved to localStorage
- Automatic cart restoration on page reload
- Cross-tab synchronization

## API Reference

### Core Methods

#### `addToCart(item: IAddToCartRequest): Observable<ICartState>`
Adds a product or package to the cart.

```typescript
// Add a product
const productItem = {
  productId: 'product_id',
  quantity: 2,
  price: 29.99,
  productName: 'Cotton T-Shirt',
  image: 'image_url',
  color: 'red',
  size: 'large',
  discount: 5.00
};

cartService.addToCart(productItem).subscribe(cartState => {
  console.log('Product added:', cartState);
});

// Add a package
const packageItem = {
  packageId: 'package_id',
  quantity: 1,
  price: 149.99,
  productName: 'Summer Package',
  image: 'package_image_url',
  packageItems: [...],
  discount: 20.00
};

cartService.addToCart(packageItem).subscribe(cartState => {
  console.log('Package added:', cartState);
});
```

#### `addPackageToCart(packageData): Observable<ICartState>`
Convenience method specifically for adding packages.

```typescript
const packageData = {
  packageId: '507f1f77bcf86cd799439013',
  quantity: 1,
  price: 149.99,
  productName: 'Summer Essentials Package',
  image: 'https://example.com/package-image.jpg',
  packageItems: [
    {
      productId: 'product_1',
      quantity: 1,
      selectedVariants: [
        { variant: 'color', value: 'blue' },
        { variant: 'size', value: 'medium' }
      ]
    }
  ],
  discount: 20.00
};

cartService.addPackageToCart(packageData).subscribe(cartState => {
  console.log('Package added to cart:', cartState);
});
```

#### `updateQuantity(productId?, quantity, color?, size?, packageId?): Observable<ICartState>`
Updates the quantity of a product or package in the cart.

```typescript
// Update product quantity
cartService.updateQuantity('product_id', 3, 'red', 'large').subscribe(cartState => {
  console.log('Product quantity updated:', cartState);
});

// Update package quantity
cartService.updateQuantity(undefined, 2, undefined, undefined, 'package_id').subscribe(cartState => {
  console.log('Package quantity updated:', cartState);
});
```

#### `removeItem(productId?, color?, size?, packageId?): Observable<ICartState>`
Removes a product or package from the cart.

```typescript
// Remove product
cartService.removeItem('product_id', 'red', 'large').subscribe(cartState => {
  console.log('Product removed:', cartState);
});

// Remove package
cartService.removeItem(undefined, undefined, undefined, 'package_id').subscribe(cartState => {
  console.log('Package removed:', cartState);
});
```

#### `clearCart(): Observable<ICartState>`
Clears all items from the cart.

```typescript
cartService.clearCart().subscribe(cartState => {
  console.log('Cart cleared:', cartState);
});
```

#### `getCart(): Observable<ICartState>`
Gets the current cart state.

```typescript
cartService.getCart().subscribe(cartState => {
  console.log('Current cart:', cartState);
  console.log('Items count:', cartState.summary.itemsCount);
  console.log('Total:', cartState.summary.total);
});
```

## Data Structures

### ICartItem Interface

```typescript
interface ICartItem {
  // Product fields
  productId?: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  image: string;
  productName: string;
  discount?: number;
  variantImage?: IArchived | null;
  
  // Package fields
  packageId?: string;
  packageItems?: IPackageItem[];
  selectedVariants?: IProductVariantAttribute[];
  
  // Common fields
  itemType?: 'product' | 'package';
}
```

### ICartState Interface

```typescript
interface ICartState {
  items: ICartItem[];
  summary: ICartSummary;
}

interface ICartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemsCount: number;
}
```

## Usage Examples

### 1. Basic Product Cart

```typescript
// Add products to cart
const tshirt = {
  productId: 'tshirt_001',
  quantity: 2,
  price: 29.99,
  productName: 'Cotton T-Shirt',
  image: 'tshirt.jpg',
  color: 'red',
  size: 'large',
  discount: 5.00
};

cartService.addToCart(tshirt).subscribe(cartState => {
  console.log('T-shirt added to cart');
});
```

### 2. Package Cart

```typescript
// Add package to cart
const summerPackage = {
  packageId: 'summer_package_001',
  quantity: 1,
  price: 149.99,
  productName: 'Summer Essentials Package',
  image: 'summer-package.jpg',
  packageItems: [
    {
      productId: 'tshirt_001',
      quantity: 1,
      selectedVariants: [
        { variant: 'color', value: 'blue' },
        { variant: 'size', value: 'medium' }
      ]
    },
    {
      productId: 'shorts_001',
      quantity: 1,
      selectedVariants: [
        { variant: 'color', value: 'white' },
        { variant: 'size', value: 'small' }
      ]
    }
  ],
  discount: 20.00
};

cartService.addPackageToCart(summerPackage).subscribe(cartState => {
  console.log('Summer package added to cart');
});
```

### 3. Mixed Cart Management

```typescript
// Create a mixed cart
cartService.addToCart(tshirt).subscribe(() => {
  cartService.addPackageToCart(summerPackage).subscribe(cartState => {
    console.log('Mixed cart created:', cartState);
    
    // Cart now contains:
    // - 1 product (T-shirt)
    // - 1 package (Summer Essentials)
    
    cartState.items.forEach(item => {
      if (item.itemType === 'Package') {
        console.log(`Package: ${item.productName}`);
        console.log(`Package items:`, item.packageItems);
      } else {
        console.log(`Product: ${item.productName}`);
        console.log(`Variants: ${item.color}, ${item.size}`);
      }
    });
  });
});
```

### 4. Cart Operations

```typescript
// Update quantities
cartService.updateQuantity('tshirt_001', 3, 'red', 'large').subscribe(cartState => {
  console.log('T-shirt quantity updated to 3');
});

cartService.updateQuantity(undefined, 2, undefined, undefined, 'summer_package_001').subscribe(cartState => {
  console.log('Package quantity updated to 2');
});

// Remove items
cartService.removeItem('tshirt_001', 'red', 'large').subscribe(cartState => {
  console.log('T-shirt removed from cart');
});

cartService.removeItem(undefined, undefined, undefined, 'summer_package_001').subscribe(cartState => {
  console.log('Package removed from cart');
});

// Clear entire cart
cartService.clearCart().subscribe(cartState => {
  console.log('Cart cleared');
});
```

### 5. Cart State Monitoring

```typescript
// Subscribe to cart changes
cartService.cartState$.subscribe(cartState => {
  console.log('Cart updated:', cartState);
  console.log('Total items:', cartState.summary.itemsCount);
  console.log('Total price:', cartState.summary.total);
  
  // Update UI based on cart state
  updateCartUI(cartState);
});

function updateCartUI(cartState: ICartState) {
  // Update cart icon badge
  const cartBadge = document.querySelector('.cart-badge');
  if (cartBadge) {
    cartBadge.textContent = cartState.summary.itemsCount.toString();
  }
  
  // Update cart total
  const cartTotal = document.querySelector('.cart-total');
  if (cartTotal) {
    cartTotal.textContent = `$${cartState.summary.total.toFixed(2)}`;
  }
}
```

## Integration with Checkout

The cart service integrates seamlessly with the checkout system:

```typescript
// In checkout component
onSubmit(): void {
  // Get cart items
  const cartItems = this.cartItems();
  
  // Convert to order items
  const orderItems = this.checkoutService.convertCartItemsToOrderItems(cartItems);
  
  // Create order
  const orderData: ICreateOrder = {
    customerId: this.authService.currentUserValue._id,
    items: orderItems,
    totalPrice: this.orderTotal(),
    status: OrderStatus.PENDING,
    paymentInfo: this.createPaymentInfo()
  };
  
  // Submit order
  this.checkoutService.createOrder(orderData).subscribe({
    next: (response) => {
      // Clear cart after successful order
      this.cartService.clearCart().subscribe();
      this.router.navigate(['/order-confirmation', response._id]);
    }
  });
}
```

## Error Handling

```typescript
cartService.addToCart(item).subscribe({
  next: (cartState) => {
    console.log('Item added successfully:', cartState);
  },
  error: (error) => {
    console.error('Error adding item to cart:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Cart Error',
      detail: 'Failed to add item to cart. Please try again.'
    });
  }
});
```

## Best Practices

### 1. **Always Check Cart State**
```typescript
cartService.getCart().subscribe(cartState => {
  if (cartState.items.length === 0) {
    console.log('Cart is empty');
    return;
  }
  
  // Process cart items
  cartState.items.forEach(item => {
    // Handle each item
  });
});
```

### 2. **Handle Item Types Properly**
```typescript
cartState.items.forEach(item => {
  if (item.itemType === 'Package') {
    // Handle package
    console.log('Package:', item.productName);
    console.log('Package items:', item.packageItems);
  } else {
    // Handle product
    console.log('Product:', item.productName);
    console.log('Variants:', item.color, item.size);
  }
});
```

### 3. **Validate Before Operations**
```typescript
// Validate before adding to cart
if (!item.productId && !item.packageId) {
  throw new Error('Item must have either productId or packageId');
}

if (item.quantity <= 0) {
  throw new Error('Quantity must be greater than 0');
}

cartService.addToCart(item).subscribe(...);
```

## Migration Guide

### From Product-Only to Mixed Cart

If you're migrating from a product-only cart system:

1. **Update Cart Item Interface**: Add package fields to your cart item interface
2. **Update Add to Cart Logic**: Handle both products and packages
3. **Update UI Components**: Display different item types appropriately
4. **Update Checkout Logic**: Convert both products and packages to order items

### Example Migration

```typescript
// Old product-only code
const addProductToCart = (product: Product) => {
  const cartItem = {
    productId: product.id,
    quantity: 1,
    price: product.price,
    // ... other fields
  };
  cartService.addToCart(cartItem);
};

// New mixed cart code
const addItemToCart = (item: Product | Package) => {
  if (item.type === 'package') {
    const cartItem = {
      packageId: item.id,
      quantity: 1,
      price: item.price,
      packageItems: item.items,
      // ... other fields
    };
    cartService.addToCart(cartItem);
  } else {
    const cartItem = {
      productId: item.id,
      quantity: 1,
      price: item.price,
      // ... other fields
    };
    cartService.addToCart(cartItem);
  }
};
```

## Conclusion

The enhanced Cart Service provides a robust foundation for managing both products and packages in a unified shopping cart experience. With proper implementation, it supports complex e-commerce scenarios while maintaining simplicity for basic use cases.