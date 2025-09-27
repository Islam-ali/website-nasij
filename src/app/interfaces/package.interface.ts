import { IProduct } from "../features/products/models/product.interface";
import { IArchived } from "./archive.interface";
import { MultilingualText } from "../core/models/multi-language";
import { ProductVariantAttribute } from "../features/products/models/product.interface";


export interface IQueryParamsBuyNow {
  type: 'product' | 'package';
  productId?: string;
  packageId?: string;
  quantity: number;
  selectedVariants?: ProductVariantAttribute[];
  name?: MultilingualText;
  price?: number;
  discount?: number;
  image?: string;
}

export interface IRequiredVariantAttribute {
  variant: string;
  value: MultilingualText;
}

export interface IPackageItem {
  productId: IProduct;
  quantity: number;
  requiredVariantAttributes: IRequiredVariantAttribute[];
  sku?: string;
  product: IProduct; // For populated data
}

export interface IPackage {
  _id?: string;
  id?: string;
  name: MultilingualText;
  description: MultilingualText;
  price: number;
  discountPrice?: number;
  stock: number;
  items: IPackageItem[];
  images: IArchived[];
  tags: string[];
  isActive: boolean;
  soldCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}



export interface IPackageOrderValidation {
  isValid: boolean;
  message: string;
  packageDetails?: IPackage;
}

export interface IPackageOrderResult {
  success: boolean;
  message: string;
  orderId?: string;
}

export interface ValidatePackageOrderDto {
  packageId: string;
  quantity: number;
  variantChoices: Array<{
    productId: string;
    variant: string;
    value: string;
  }>;
} 