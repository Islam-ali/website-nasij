import { IArchived } from "./archive.interface";


export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: IArchived;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}
