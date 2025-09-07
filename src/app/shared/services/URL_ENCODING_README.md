# URL Encoding Service - Complete Guide

## Overview

The URL Encoding Service provides a comprehensive solution for encoding and decoding complex data structures (packages, products, cart items) in URL query parameters. This enables sharing of detailed product/package configurations, cart states, and checkout data through URLs.

## Services Architecture

### 1. **QueryParamsService** (Core Service)
- Base encoding/decoding functionality
- Data validation and integrity checking
- Compression support for large objects

### 2. **PackageUrlService** (Package-specific)
- Package data encoding/decoding
- Navigation with encoded package data
- Shareable package URLs

### 3. **ProductUrlService** (Product-specific)
- Product data encoding/decoding
- Navigation with encoded product data
- Shareable product URLs

## Features

### ✅ Core Features

#### **1. Data Encoding/Decoding**
```typescript
// Encode any data
const encoded = queryParamsService.encode(data);

// Decode data with type safety
const decoded = queryParamsService.decode<MyType>(encoded);
```

#### **2. Package Support**
```typescript
// Encode package data
const encodedPackage = queryParamsService.encodePackage({
  packageId: 'package_123',
  quantity: 2,
  price: 149.99,
  productName: 'Summer Package',
  packageItems: [...]
});

// Decode package data
const packageData = queryParamsService.decodePackage(encodedPackage);
```

#### **3. Product Support**
```typescript
// Encode product data
const encodedProduct = queryParamsService.encodeProduct({
  productId: 'product_123',
  quantity: 1,
  price: 29.99,
  productName: 'Cotton T-Shirt',
  color: 'red',
  size: 'large'
});

// Decode product data
const productData = queryParamsService.decodeProduct(encodedProduct);
```

#### **4. Multiple Items Support**
```typescript
// Encode multiple items
const encodedItems = queryParamsService.encodeItems([
  { type: 'product', ... },
  { type: 'package', ... }
]);

// Decode multiple items
const itemsData = queryParamsService.decodeItems(encodedItems);
```

#### **5. Cart State Support**
```typescript
// Encode entire cart
const encodedCart = queryParamsService.encodeCart({
  items: [...],
  summary: { subtotal: 100, total: 120, ... }
});

// Decode cart data
const cartData = queryParamsService.decodeCart(encodedCart);
```

## Usage Examples

### 1. **Package Details with Encoded Data**

#### **Encoding Package Data:**
```typescript
// In Package Details Component
const packageData = {
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
    }
  ],
  discount: 20.00,
  selectedVariants: this.selectedVariantsByQuantity()
};

// Navigate to cart with encoded data
this.packageUrlService.navigateToCartWithPackage(packageData);

// Navigate to checkout with encoded data
this.packageUrlService.navigateToCheckoutWithPackage(packageData);
```

#### **Decoding Package Data:**
```typescript
// In Package Details Component
ngOnInit(): void {
  this.route.queryParams.subscribe(queryParams => {
    const encodedPackageData = this.packageUrlService.getPackageFromUrl(queryParams);
    
    if (encodedPackageData && encodedPackageData.data) {
      // Use encoded package data
      this.handleEncodedPackageData(encodedPackageData.data);
    }
  });
}

private handleEncodedPackageData(encodedData: any): void {
  // Load package and pre-fill form
  this.packageService.getPackage(encodedData.packageId).subscribe(package => {
    this.package.set(package);
    
    // Pre-fill form with encoded data
    if (encodedData.quantity) {
      this.quantity.set(encodedData.quantity);
    }
    
    if (encodedData.selectedVariants) {
      this.selectedVariantsByQuantity.set(encodedData.selectedVariants);
    }
  });
}
```

### 2. **Cart with Encoded Data**

#### **Adding Items via URL:**
```typescript
// In Cart Component
ngOnInit(): void {
  this.route.queryParams.subscribe(queryParams => {
    this.handleEncodedData(queryParams);
  });
}

private handleEncodedData(queryParams: any): void {
  // Check for encoded package data
  if (queryParams['addPackage']) {
    const encodedPackageData = this.packageUrlService.getPackageFromUrl({ 
      package: queryParams['addPackage'] 
    });
    
    if (encodedPackageData && encodedPackageData.data) {
      this.addEncodedPackageToCart(encodedPackageData.data);
    }
  }

  // Check for encoded product data
  if (queryParams['addProduct']) {
    const encodedProductData = this.productUrlService.getProductFromUrl({ 
      product: queryParams['addProduct'] 
    });
    
    if (encodedProductData && encodedProductData.data) {
      this.addEncodedProductToCart(encodedProductData.data);
    }
  }
}
```

### 3. **Checkout with Encoded Data**

#### **Direct Checkout from Package:**
```typescript
// In Package Details Component
buyNow(): void {
  const packageDataForUrl = {
    packageId: packageData._id,
    quantity: this.quantity(),
    price: packageData.price,
    productName: packageData.name,
    image: packageData.images?.[0]?.url || '',
    packageItems: packageData.items.map(item => ({
      productId: item.productId._id,
      quantity: this.getSelectedQuantity(item.productId._id),
      selectedVariants: this.selectedVariants[item.productId._id] || {}
    })),
    discount: packageData.discountPrice ? packageData.price - packageData.discountPrice : 0,
    selectedVariants: this.selectedVariantsByQuantity()
  };

  // Navigate to checkout with encoded package data
  this.packageUrlService.navigateToCheckoutWithPackage(packageDataForUrl);
}
```

#### **Checkout Processing:**
```typescript
// In Checkout Component
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    if (this.handleEncodedData(params)) {
      return;
    }
    // Handle regular cart checkout...
  });
}

private handleEncodedData(params: any): boolean {
  // Check for encoded package data
  if (params['package']) {
    const encodedPackageData = this.packageUrlService.getPackageFromUrl(params);
    if (encodedPackageData && encodedPackageData.data) {
      this.handleEncodedPackage(encodedPackageData.data);
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

  return false;
}
```

### 4. **Shareable URLs**

#### **Creating Shareable Package URLs:**
```typescript
// Create shareable URL for a package
const shareableUrl = this.packageUrlService.createShareablePackageUrl({
  packageId: 'summer_package_001',
  quantity: 1,
  price: 149.99,
  productName: 'Summer Essentials Package',
  image: 'summer-package.jpg',
  packageItems: [...]
});

// Result: https://yoursite.com/packages/details?package=eyJ0eXBlIjoicGFja2FnZSIsImRhdGEiOi...
```

#### **Creating Shareable Product URLs:**
```typescript
// Create shareable URL for a product
const shareableUrl = this.productUrlService.createShareableProductUrl({
  productId: 'tshirt_001',
  quantity: 2,
  price: 29.99,
  productName: 'Cotton T-Shirt',
  image: 'tshirt.jpg',
  color: 'red',
  size: 'large'
});

// Result: https://yoursite.com/products/details?product=eyJ0eXBlIjoicHJvZHVjdCIsImRhdGEiOi...
```

## URL Structure

### **Package URLs:**
```
/packages/details?package={encodedPackageData}&source=encoded
/cart?addPackage={encodedPackageData}&source=package
/checkout?package={encodedPackageData}&buyNow=true&source=package
```

### **Product URLs:**
```
/products/details?product={encodedProductData}&source=encoded
/cart?addProduct={encodedProductData}&source=product
/checkout?product={encodedProductData}&buyNow=true&source=product
```

### **Multiple Items URLs:**
```
/checkout?items={encodedItemsData}&buyNow=true&source=items
```

### **Cart URLs:**
```
/checkout?cart={encodedCartData}&source=cart
```

## Data Validation

### **Automatic Validation:**
```typescript
// Validate encoded data integrity
const isValid = queryParamsService.validateEncodedData(encodedString);

// Validate with age limit (24 hours)
const isValid = queryParamsService.validateEncodedData(encodedString, 24 * 60 * 60 * 1000);
```

### **Error Handling:**
```typescript
try {
  const decoded = queryParamsService.decode(encodedString);
  // Process decoded data
} catch (error) {
  console.error('Failed to decode data:', error);
  // Handle error gracefully
}
```

## Security Features

### **1. Data Integrity**
- Base64 encoding with proper error handling
- Timestamp validation for data freshness
- JSON structure validation

### **2. URL Safety**
- Proper URL encoding/decoding
- Safe character handling
- Length validation

### **3. Error Recovery**
- Graceful fallback to regular navigation
- User-friendly error messages
- Automatic URL cleanup

## Performance Optimizations

### **1. Compression Support**
```typescript
// Compress large objects before encoding
const compressed = queryParamsService.compressAndEncode(largeObject);

// Decompress and decode
const decompressed = queryParamsService.decompressAndDecode(compressed);
```

### **2. Efficient Navigation**
- Automatic URL cleanup after processing
- Minimal DOM updates
- Optimized query parameter handling

## Integration Points

### **1. Package Details Component**
- ✅ Encoded package data loading
- ✅ Pre-filled form data
- ✅ Navigation with encoded data

### **2. Cart Component**
- ✅ Adding items via encoded URLs
- ✅ Automatic cart updates
- ✅ URL cleanup

### **3. Checkout Component**
- ✅ Direct checkout from encoded data
- ✅ Mixed cart support
- ✅ Legacy compatibility

### **4. Product Components**
- ✅ Product data encoding/decoding
- ✅ Variant selection preservation
- ✅ Shareable product URLs

## Best Practices

### **1. URL Length Management**
```typescript
// For large data, use compression
const compressed = queryParamsService.compressAndEncode(largeData);

// Or split into multiple parameters
const part1 = queryParamsService.encode(dataPart1);
const part2 = queryParamsService.encode(dataPart2);
```

### **2. Error Handling**
```typescript
// Always wrap in try-catch
try {
  const decoded = queryParamsService.decode(encoded);
  // Process data
} catch (error) {
  // Fallback to regular navigation
  this.router.navigate(['/fallback-route']);
}
```

### **3. Data Validation**
```typescript
// Validate before processing
if (queryParamsService.validateEncodedData(encoded)) {
  const decoded = queryParamsService.decode(encoded);
  // Process valid data
} else {
  // Handle invalid data
}
```

### **4. URL Cleanup**
```typescript
// Clean up encoded data after processing
this.packageUrlService.clearEncodedDataFromUrl(this.route);
```

## Migration Guide

### **From Legacy URLs:**
```typescript
// Old way
this.router.navigate(['/checkout'], {
  queryParams: {
    productId: '123',
    quantity: 2,
    color: 'red',
    size: 'large'
  }
});

// New way
const productData = {
  productId: '123',
  quantity: 2,
  color: 'red',
  size: 'large',
  price: 29.99,
  productName: 'T-Shirt',
  image: 'tshirt.jpg'
};
this.productUrlService.navigateToCheckoutWithProduct(productData);
```

## Testing

### **Unit Tests:**
```typescript
describe('QueryParamsService', () => {
  it('should encode and decode data correctly', () => {
    const originalData = { test: 'data', number: 123 };
    const encoded = service.encode(originalData);
    const decoded = service.decode(encoded);
    expect(decoded).toEqual(originalData);
  });

  it('should validate encoded data', () => {
    const encoded = service.encode({ test: 'data' });
    expect(service.validateEncodedData(encoded)).toBe(true);
  });
});
```

## Conclusion

The URL Encoding Service provides a robust, secure, and efficient way to handle complex data in URLs. It supports:

✅ **Complete Package Support** - Full package data with variants
✅ **Product Integration** - Product data with variants
✅ **Cart Management** - Cart state preservation
✅ **Checkout Flow** - Direct checkout from encoded data
✅ **Shareable URLs** - Easy sharing of product/package configurations
✅ **Error Handling** - Graceful fallbacks and error recovery
✅ **Performance** - Compression and optimization
✅ **Security** - Data validation and integrity checking

The system is production-ready and provides a seamless user experience for sharing and navigating with complex product/package data.