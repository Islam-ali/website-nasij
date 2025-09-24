import { MultilingualText } from "../../../core/models/multi-language";
import { OrderStatus } from "../../../interfaces/product.interface";
import { PaymentMethod, PaymentStatus, OrderItemType } from "./order.enum"
import { EnumProductVariant } from '../../products/models/product.interface';

// Backend-compatible interfaces - matches CreateOrderDto
export interface ICreateOrder {
  customerId?: string;
  items: IOrderItem[];
  totalPrice: number;
  status?: OrderStatus;
  
  // Additional fields from backend DTO
  orderId?: string;
  orderDate?: Date;
  user?: string;
  coupon?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  total?: number;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  cashPayment?: {
    amountPaid: number;
    changeDue: number;
  };
  shippingAddress?: IShippingAddress;
  paymentMethod?: PaymentMethod;
  deliveryDate?: string;
  notes?: string;
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
  // color?: MultilingualText;
  // size?: MultilingualText;
  packageItems?: IPackageItem[];
  selectedVariants?: IProductVariantAttribute[];
}

export interface IPackageItem {
  productId: string;
  productName?: MultilingualText;
  quantity: number;
  price?: number;
  image?: string;
  selectedVariants: IProductVariantAttribute[];
}

export interface IProductVariantAttribute {
  variant: EnumProductVariant;
  value: MultilingualText;
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