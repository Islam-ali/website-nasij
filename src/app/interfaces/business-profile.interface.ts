import { IArchived } from './archive.interface';
import { MultilingualText } from '../core/models/multi-language';

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
  address: MultilingualText;
  mapLocation?: string;
}

export interface IFAQ {
  question: MultilingualText;
  answer: MultilingualText;
}

export interface IBusinessProfile {
  _id: string;
  logo_dark?: IArchived;
  logo_light?: IArchived;
  name: MultilingualText;
  description: MultilingualText;
  socialMedia: ISocialMedia;
  contactInfo: IContactInfo;
  privacyPolicy: MultilingualText;
  termsOfService: MultilingualText;
  faq: IFAQ[];
  createdAt: Date;
  updatedAt: Date;
} 