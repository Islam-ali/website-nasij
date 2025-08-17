import { IArchived } from "./archive.interface";

export interface Feature {
  _id?: string;
  icon: IArchived;        // أيقونة (اسم أيقونة، أو كلاس من مكتبة، أو SVG URL)
  title: string;       // "Free Shipping"
  description: string; // "Free shipping on all orders over $50..."
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 