import { IArchived } from "./archive.interface";
import { MultilingualText } from "../core/models/multi-language";

export interface Feature {
  _id?: string;
  icon: IArchived;        // أيقونة (اسم أيقونة، أو كلاس من مكتبة، أو SVG URL)
  title: MultilingualText;       // "Free Shipping"
  description: MultilingualText; // "Free shipping on all orders over $50..."
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 