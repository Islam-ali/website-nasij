import { MultilingualText } from "../core/models/multi-language";
import { IArchived } from "./archive.interface";

export interface BannerButton {
  label: MultilingualText;             // "Shop Sale"
  url: string;               // "/shop/sale"
  params?: Record<string, string>; // { category: "men", sort: "new" }
}

export interface Banner {
  _id?: string;
  tag: MultilingualText ;               // "Limited Time Offer"
  title: MultilingualText;             // "Get 50% Off On New Arrivals"
  description: MultilingualText;       // "Don't miss out..."
  image: IArchived;          // الصورة الجانبية
  buttons: BannerButton[];
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  background?: string;       // Background color or gradient
  alignItems?: string;      // Vertical alignment (flex-start, center, flex-end)
  justifyContent?: string;   // Horizontal alignment (flex-start, center, flex-end, space-between, space-around)
  createdAt?: Date;
  updatedAt?: Date;
} 