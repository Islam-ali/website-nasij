import { MultilingualText } from '../../../core/models/multi-language';
import { IArchived } from '../../../interfaces/archive.interface';
import { IPackageItem } from '../../checkout/models/checkout';
import { ICountry, IState } from '../../../core/models/location.interface';
import { ProductVariantAttribute } from '../../products/models/product.interface';

export interface ICartItem {
  // Product fields
  productId?: string;
  quantity: number;
  price: number;
  image: string;
  productName: MultilingualText;
  discount?: number;
  variantImage?: IArchived | null;
  
  // Package fields
  packageId?: string;
  packageItems?: IPackageItem[];
  selectedVariants?: ProductVariantAttribute[];
  
  // Common fields
  itemType?: 'product' | 'package';
}

export interface ICartSummary {
  subtotal: number;
  discount: number;
  total: number;
  itemsCount: number;
  selectedCountry?: ICountry;
  selectedState?: IState;
  shippingCost: number;
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
