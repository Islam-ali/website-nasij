import { MultilingualText } from "../../../core/models/multi-language";

export interface IBrand {
  _id?: string;
  name: MultilingualText;
  description?: MultilingualText;
  logo?: string;
  website?: string;
  slug: string;
  isActive: boolean;
  productCount: number;
}
