import { IArchived } from "./archive.interface";

export interface IReview {
  _id?: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string;
  images?: IArchived[];
  video?: IArchived;
  videoUrl?: string;
  isActive: boolean;
  isPinned: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
  reviewDate: string;
}

