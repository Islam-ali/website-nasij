import { IArchived } from "./archive.interface";
import { MultilingualText } from "../core/models/multi-language";

export interface ICategory {
  _id?: string;
  name: MultilingualText;
  slug: MultilingualText;
  description?: MultilingualText;
  parentId?: string;
  image?: IArchived;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  packageCount: number;
}
