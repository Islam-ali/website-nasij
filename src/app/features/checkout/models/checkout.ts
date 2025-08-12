import { OrderStatus, PaymentMethod, PaymentStatus } from "./order.enum"

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
  
  export interface IShippingAddress {
    fullName: string
    phone: string
    address: string
    state: string
    city: string
    country: string
  }
  