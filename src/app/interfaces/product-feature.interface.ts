import { MultilingualText } from "../core/models/multi-language";


export interface IFilterRule {
  field: string;
  operator: string;
  value: any;
}

export interface ISortingRule {
  field: string;
  order: 'asc' | 'desc';
}

export enum HeaderAlignment {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

export interface IProductFeature {
  _id: string;
  title: MultilingualText;
  description: MultilingualText;
  limit: number;
  sorting?: ISortingRule;
  filters?: IFilterRule[];
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}







