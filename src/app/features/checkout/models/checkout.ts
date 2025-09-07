import { OrderStatus } from "../../../../../../pledge-dashbord/src/app/interfaces/order.interface";
import { PaymentMethod, PaymentStatus, OrderItemType } from "./order.enum"

// Backend-compatible interfaces
export interface ICreateOrder {
  customerId?: string;
  items: IOrderItem[];
  totalPrice: number;
  status?: OrderStatus;
  createdAt?: string;
  paymentInfo: IPaymentInfo;
  shippingAddress: IShippingAddress;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
}

export interface IOrderItem {
  itemType: OrderItemType;
  itemId: string;
  quantity: number;
  price?: number;
  discountPrice?: number;
  color?: string;
  size?: string;
  packageItems?: IPackageItem[];
  selectedVariants?: IProductVariantAttribute[];
}

export interface IPackageItem {
  productId: string;
  productName?: string;
  quantity: number;
  price?: number;
  image?: string;
  selectedVariants: IProductVariantAttribute[];
}

export interface IProductVariantAttribute {
  variant: string;
  value: string;
  image?: string;
}

export interface IPaymentInfo {
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  cashPayment?: number;
  transactionId?: string;
  gatewayReference?: string;
  paidAt?: string;
  refundAmount?: number;
  refundedAt?: string;
  notes?: string;
}

// Legacy checkout interface (for backward compatibility)
export interface ICheckout {
    items: Item[]
    subtotal: number
    tax: number
    shippingCost: number
    total: number
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: PaymentMethod
    shippingAddress: IShippingAddress
    notes: string
  }
  
  export interface Item {
    productId: string
    quantity: number
    price: number
    totalPrice: number
    discountPrice: number
    color: string
    size: string
  }