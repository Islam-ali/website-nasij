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
  createdAt?: Date;
  updatedAt?: Date;
} 