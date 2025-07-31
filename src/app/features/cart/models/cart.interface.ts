import { IProduct } from '../../products/models/product.interface';

export interface ICartItem {
  productId: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  product?: IProduct; // Full product details (optional)
}

export interface ICartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemsCount: number;
}

export interface ICartState {
  items: ICartItem[];
  summary: ICartSummary;
}

// For adding/updating items in cart
export interface IAddToCartRequest {
  productId: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

// For the cart item component
export interface ICartItemComponent extends ICartItem {
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  loading?: boolean;
}
