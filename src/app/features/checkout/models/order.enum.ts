export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
export enum PaymentMethod {
  Cash = 'cash',
  CreditCard = 'credit_card',
  PayPal = 'paypal',
  BankTransfer = 'bank_transfer'
}