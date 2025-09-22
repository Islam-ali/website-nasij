import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";
import { MultilingualText } from "../core/models/multi-language";

export interface ProductVariant {
  name: string;
  value: MultilingualText;
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
  name: MultilingualText;
  description: MultilingualText;
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
  details: { name: MultilingualText; value: MultilingualText }[];
  seoTitle?: MultilingualText;
  seoDescription?: MultilingualText;
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
