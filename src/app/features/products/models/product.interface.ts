import { IArchived } from "../../../interfaces/archive.interface";
import { IBrand } from "../models/brand.interface";
import { ICategory } from "../../../interfaces/category.interface";

export enum EnumProductVariant {
  SIZE = 'size',
  COLOR = 'color',
}

export interface ProductVariant {
  attributes?: ProductVariantAttribute[];
  price: number;
  stock?: number;
  sku?: string;
  image?: IArchived;
}

export interface ProductVariantAttribute {
  variant: string;
  value: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  factoryPrice?: number;
  category: ICategory;
  brand: IBrand;
  images: IArchived[];
  variants: ProductVariant[];
  stock: number;
  status: ProductStatus;
  tags: string[];
  colors?: string[];
  sizes?: string[];
  gender?: string;
  season?: string;
  details: { name: string; value: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
  isInWishlist?: boolean;
}

export interface IProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  inStock?: boolean;
  isFeatured?: boolean;
}

export interface IProductListResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
