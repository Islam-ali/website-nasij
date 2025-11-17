import { PaymentMethod, PaymentStatus } from "../../features/checkout/models/order.enum";
import { IPackage } from "../../interfaces/package.interface";
import { IProduct, OrderStatus } from "../../interfaces/product.interface";
import { ICountry, IState } from "./location.interface";

export interface OrderItem {
  itemType: 'Product' | 'Package';
  itemId: IProduct | IPackage;
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: {
    id: string;
    name: string;
    value: string;
  };
}

export interface OrderAddress {
  fullName: string;
  address: string;
  city: string;
  state: IState;
  country: ICountry;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  date: Date;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  isDeposit?: boolean;
  amountPaid?: number;
}
