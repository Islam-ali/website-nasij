import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";

export interface ProductVariant {
  name: string;
  value: string;
  price: number;
  stock?: number;
  sku?: string;
  _id?: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
  RETURNED = 'returned',
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
  onSale?: boolean;
}

export interface IArchived {
  id: number;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  folderName: string;
  filePath: string;
  uploadDate: string;
  uploadedBy: string;
  tenantUniqueID: string;
  metadata: string;
  storageLocation: string;
  version: number;
  thumbnailPath: any;
}
