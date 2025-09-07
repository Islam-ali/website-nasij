# Checkout Integration with Backend

## Overview

This document describes the complete integration between the frontend checkout system and the backend order management system, supporting both individual products and packages with comprehensive payment processing.

## Architecture

### Frontend (Angular)
- **CheckoutComponent**: Main checkout interface
- **CheckoutService**: Service for order creation and payment processing
- **Models**: TypeScript interfaces matching backend DTOs

### Backend (NestJS)
- **OrderController**: REST API endpoints for order management
- **OrderService**: Business logic for order processing
- **DTOs**: Data transfer objects with validation

## Features

### ✅ Completed Features

#### 1. **Order Creation**
- Support for both products and packages
- Variant selection for products
- Package item management
- Customer authentication integration

#### 2. **Payment Processing**
- Multiple payment methods (Cash, Credit Card, Bank Transfer, PayPal)
- Payment status tracking
- Cash payment handling
- Transaction ID management

#### 3. **Data Structure**
- Backend-compatible interfaces
- Type-safe data transfer
- Validation on both frontend and backend

#### 4. **Authentication**
- User authentication integration
- Customer ID management
- Guest checkout support

## Data Flow

### 1. Cart to Order Conversion

```typescript
// Cart Item (Frontend)
interface ICartItem {
  productId?: string;
  packageId?: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  // ... other fields
}

// Order Item (Backend Compatible)
interface IOrderItem {
  itemType: OrderItemType;
  itemId: string;
  quantity: number;
  price?: number;
  discountPrice?: number;
  selectedVariants?: IProductVariantAttribute[];
  packageItems?: IPackageItem[];
}
```

### 2. Order Creation Process

```typescript
// 1. Convert cart items to order items
const orderItems = checkoutService.convertCartItemsToOrderItems(cartItems);

// 2. Create payment info
const paymentInfo = checkoutService.createPaymentInfo(
  paymentMethod,
  cashAmount,
  notes
);

// 3. Create order
const orderData: ICreateOrder = {
  customerId: currentUser._id,
  items: orderItems,
  totalPrice: orderTotal,
  status: OrderStatus.PENDING,
  paymentInfo: paymentInfo
};

// 4. Submit to backend
checkoutService.createOrder(orderData).subscribe(...);
```

## API Endpoints

### Order Management

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "itemType": "product",
      "itemId": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "price": 29.99,
      "discountPrice": 24.99,
      "selectedVariants": [
        { "variant": "color", "value": "red" },
        { "variant": "size", "value": "large" }
      ]
    }
  ],
  "totalPrice": 49.98,
  "status": "pending",
  "paymentInfo": {
    "paymentStatus": "pending",
    "paymentMethod": "cash",
    "cashPayment": 50.00,
    "notes": "Cash payment on delivery"
  }
}
```

#### Process Payment
```http
POST /api/orders/{orderId}/process-payment
Content-Type: application/json

{
  "paymentMethod": "cash",
  "amount": 50.00,
  "notes": "Cash payment received"
}
```

#### Update Payment
```http
PATCH /api/orders/{orderId}/payment
Content-Type: application/json

{
  "paymentStatus": "paid",
  "paidAt": "2024-01-15T10:30:00.000Z",
  "notes": "Payment confirmed"
}
```

#### Process Refund
```http
POST /api/orders/{orderId}/refund
Content-Type: application/json

{
  "refundAmount": 25.00,
  "reason": "Customer requested refund",
  "notes": "Partial refund processed"
}
```

## Payment Methods

### Supported Payment Methods

1. **Cash Payment**
   - Direct cash collection
   - Amount tracking
   - Delivery confirmation

2. **Credit Card**
   - Gateway integration ready
   - Transaction ID tracking
   - Secure processing

3. **Bank Transfer**
   - Bank transfer confirmation
   - Reference tracking
   - Manual verification

4. **PayPal**
   - PayPal integration ready
   - Gateway reference tracking

## Order Types

### Product Orders
```typescript
{
  itemType: "product",
  itemId: "product_id",
  quantity: 2,
  price: 29.99,
  selectedVariants: [
    { variant: "color", value: "red" },
    { variant: "size", value: "large" }
  ]
}
```

### Package Orders
```typescript
{
  itemType: "package",
  itemId: "package_id",
  quantity: 1,
  price: 149.99,
  packageItems: [
    {
      productId: "product_id_1",
      quantity: 1,
      selectedVariants: [
        { variant: "color", value: "blue" }
      ]
    }
  ]
}
```

## Error Handling

### Frontend Error Handling
```typescript
this.checkoutService.createOrder(orderData).subscribe({
  next: (response) => {
    // Success handling
    this.success = true;
    this.cartService.clearCart();
  },
  error: (error) => {
    // Error handling
    this.messageService.add({
      severity: 'error',
      summary: 'Order Failed',
      detail: error.error?.message || 'Failed to place order'
    });
  }
});
```

### Backend Error Handling
```typescript
try {
  const result = await this.orderService.create(createOrderDto);
  return result;
} catch (error) {
  throw new HttpException({
    statusCode: 400,
    message: error.message || 'Order creation failed',
    error: 'Bad Request'
  }, HttpStatus.BAD_REQUEST);
}
```

## Validation

### Frontend Validation
- Form validation using Angular Reactive Forms
- Required field validation
- Payment method validation
- Cart item validation

### Backend Validation
- DTO validation using class-validator
- MongoDB ObjectId validation
- Payment amount validation
- Order status validation

## Security

### Authentication
- JWT token-based authentication
- User role validation
- Customer ID verification

### Data Validation
- Input sanitization
- Type validation
- Business rule validation

## Testing

### Frontend Testing
```typescript
// Test order creation
it('should create order successfully', () => {
  const orderData = createMockOrderData();
  checkoutService.createOrder(orderData).subscribe(response => {
    expect(response).toBeDefined();
    expect(response.status).toBe('pending');
  });
});
```

### Backend Testing
```typescript
// Test order creation
it('should create order', async () => {
  const createOrderDto = createMockCreateOrderDto();
  const result = await orderService.create(createOrderDto);
  expect(result).toBeDefined();
  expect(result.status).toBe(OrderStatus.PENDING);
});
```

## Future Enhancements

### TODO Items
- [ ] Implement payment gateway integration (Stripe, PayPal)
- [ ] Add order status notifications
- [ ] Implement inventory management
- [ ] Add order tracking system
- [ ] Implement refund processing logic
- [ ] Add order analytics and reporting

### Payment Gateway Integration
```typescript
// Stripe Integration Example
async processStripePayment(orderId: string, paymentData: ProcessPaymentDto) {
  const order = await this.orderService.findOne(orderId);
  const paymentIntent = await this.stripeService.createPaymentIntent({
    amount: order.totalPrice * 100, // Convert to cents
    currency: 'usd',
    metadata: { orderId }
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}
```

## Usage Examples

### Basic Checkout Flow
```typescript
// 1. User fills checkout form
// 2. Form validation passes
// 3. Convert cart to order items
const orderItems = this.checkoutService.convertCartItemsToOrderItems(this.cartItems());

// 4. Create payment info
const paymentInfo = this.checkoutService.createPaymentInfo(
  PaymentMethod.CASH,
  this.orderTotal(),
  'Cash on delivery'
);

// 5. Create order
const orderData: ICreateOrder = {
  customerId: this.authService.currentUserValue._id,
  items: orderItems,
  totalPrice: this.orderTotal(),
  status: OrderStatus.PENDING,
  paymentInfo: paymentInfo
};

// 6. Submit order
this.checkoutService.createOrder(orderData).subscribe({
  next: (response) => {
    // Success - redirect to confirmation
    this.router.navigate(['/order-confirmation', response._id]);
  },
  error: (error) => {
    // Handle error
    this.messageService.add({
      severity: 'error',
      summary: 'Order Failed',
      detail: error.error?.message
    });
  }
});
```

### Package Order Example
```typescript
// Package with multiple products
const packageOrder: ICreateOrder = {
  customerId: 'customer_id',
  items: [
    {
      itemType: OrderItemType.PACKAGE,
      itemId: 'package_id',
      quantity: 1,
      price: 149.99,
      discountPrice: 119.99,
      packageItems: [
        {
          productId: 'product_1',
          quantity: 1,
          selectedVariants: [
            { variant: 'color', value: 'blue' },
            { variant: 'size', value: 'medium' }
          ]
        },
        {
          productId: 'product_2',
          quantity: 2,
          selectedVariants: [
            { variant: 'color', value: 'red' },
            { variant: 'size', value: 'small' }
          ]
        }
      ]
    }
  ],
  totalPrice: 119.99,
  status: OrderStatus.PENDING,
  paymentInfo: {
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    cashPayment: 120.00,
    notes: 'Package order - cash payment'
  }
};
```

## Conclusion

The checkout integration provides a complete, type-safe, and scalable solution for order management with support for both products and packages. The system is designed to be extensible and maintainable, with clear separation of concerns between frontend and backend components.

The integration supports:
- ✅ Multiple item types (products and packages)
- ✅ Comprehensive payment processing
- ✅ User authentication
- ✅ Error handling and validation
- ✅ Type safety across the stack
- ✅ Extensible architecture for future enhancements