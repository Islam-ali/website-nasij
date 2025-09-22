import { MultilingualText } from '../../../core/models/multi-language';
import { IArchived } from '../../../interfaces/archive.interface';
import { IPackageItem, IProductVariantAttribute } from '../../checkout/models/checkout';

export interface ICartItem {
  // Product fields
  productId?: string;
  color?: MultilingualText | null;
  size?: MultilingualText | null;
  quantity: number;
  price: number;
  image: string;
  productName: MultilingualText;
  discount?: number;
  variantImage?: IArchived | null;
  
  // Package fields
  packageId?: string;
  packageItems?: IPackageItem[];
  selectedVariants?: any;
  
  // Common fields
  itemType?: 'product' | 'package';
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
export interface IAddToCartRequest extends ICartItem {}

// For the cart item component
export interface ICartItemComponent extends ICartItem {
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  loading?: boolean;
}
