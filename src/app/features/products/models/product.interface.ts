import { IArchived } from "../../../interfaces/product.interface";
import { IBrand } from "../models/brand.interface";
import { ICategory } from "../models/category.interface";

export interface ProductVariant {
  name: string;
  value: string;
  price: number;
  stock?: number;
  sku?: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface IProduct {
  _id: string | null;
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: ICategory;
  brand: IBrand;
  images: IArchived[];
  variants: ProductVariant[];
  stock: number;
  status: ProductStatus;
  sku: string;
  tags: string[];
  weight?: number;
  colors?: string[];
  size?: string[];
  gender?: string;
  season?: string;
  material?: string;
  details: { name: string; value: string }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
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
