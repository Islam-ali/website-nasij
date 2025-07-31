import { IProduct } from '../../../features/products/models/product.interface';

export interface IWishlistItem {
  productId: string;
  variantId?: string;
  addedAt: Date;
  product?: IProduct; // Full product details (optional, can be loaded when needed)
}

export interface IWishlistState {
  items: IWishlistItem[];
  count: number;
}

// For adding items to wishlist
export interface IAddToWishlistRequest {
  productId: string;
  variantId?: string;
}

// For the wishlist item component
export interface IWishlistItemComponent extends IWishlistItem {
  onRemove?: () => void;
  onMoveToCart?: () => void;
  loading?: boolean;
}
