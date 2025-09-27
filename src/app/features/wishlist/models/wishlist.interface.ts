import { MultilingualText } from "../../../core/models/multi-language";
import { IProduct } from "../../products/models/product.interface";
import { ProductVariantAttribute } from "../../products/models/product.interface";

export interface IWishlistItem {
  productId: string;
  variantId?: string;
  addedAt: Date;
  product: IProduct; // Full product details (optional, can be loaded when needed)
  price?: number; // Added to match cart item structure
  productName?: MultilingualText; // Added to match cart item structure
  image?: string; // Added to match cart item structure
  selectedVariants?: ProductVariantAttribute[];
}

export interface IWishlistSummary {
  itemsCount: number;
  // Add other summary fields as needed
  // For example:
  // subtotal: number;
  // discount: number;
  // total: number;
}

export interface IWishlistState {
  items: IWishlistItem[];
  summary: IWishlistSummary;
}

// For adding items to wishlist
export interface IAddToWishlistRequest extends IWishlistItem {}

// For the wishlist item component
export interface IWishlistItemComponent extends IWishlistItem {
  onRemove?: () => void;
  onMoveToCart?: () => void;
  loading?: boolean;
}
