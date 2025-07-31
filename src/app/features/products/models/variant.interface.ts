export interface IVariantOption {
  name: string;
  value: string;
}

export interface IVariant {
  _id: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  options: IVariantOption[];
  isDefault?: boolean;
  image?: string;
  barcode?: string;
  [key: string]: any; // For additional properties
}

export interface IProductVariant {
  variantId: string;
  options: {
    name: string;
    value: string;
  }[];
  price: number;
  stock: number;
  sku: string;
  image?: string;
}
