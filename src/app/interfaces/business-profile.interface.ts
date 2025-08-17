import { IArchived } from './archive.interface';

export interface ISocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface IContactInfo {
  email: string;
  phone: string;
  address: string;
  mapLocation?: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IBusinessProfile {
  _id: string;
  logo?: IArchived;
  name: string;
  description: string;
  socialMedia: ISocialMedia;
  contactInfo: IContactInfo;
  privacyPolicy: string;
  termsOfService: string;
  faq: IFAQ[];
  createdAt: Date;
  updatedAt: Date;
} 