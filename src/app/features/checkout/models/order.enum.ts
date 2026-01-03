
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  WALLET = 'wallet',
  VODAFONE_CASH = 'vodafone_cash',
  PAYMOB = 'paymob'
}

export enum OrderItemType {
  PRODUCT = 'Product',
  PACKAGE = 'Package'
}

export enum PaymentGateway {
  PAYMOB = 'paymob',
  VODAFONE_CASH = 'vodafone_cash',
  CASH = 'cash'
}

export enum PaymentMethodType {
  CARD = 'card',
  WALLET = 'wallet',
}
