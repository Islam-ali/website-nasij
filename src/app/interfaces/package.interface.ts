import { IProduct } from "../features/products/models/product.interface";
import { IArchived } from "./archive.interface";


export interface IQueryParamsBuyNow {
  type: 'product' | 'package';
  productId?: string;
  packageId?: string;
  quantity: number;
  color?: string;
  size?: string;
  name?: string;
  price?: number;
  discount?: number;
  image?: string;
}

export interface IRequiredVariantAttribute {
  variant: string;
  value: string;
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
  name: string;
  description: string;
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