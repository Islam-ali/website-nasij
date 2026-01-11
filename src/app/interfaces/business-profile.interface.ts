import { IArchived } from './archive.interface';
import { MultilingualText } from '../core/models/multi-language';
import { HeaderAlignment } from './product-feature.interface';

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

export interface IScript {
  position: 'head' | 'body';
  script: string;
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
  primaryColor?: string;
  headerAlignment?: HeaderAlignment;
  faq: IFAQ[];
  metaTitle?: MultilingualText;
  metaDescription?: MultilingualText;
  metaKeywords?: string[];
  metaTags?: string;
  scripts?: IScript[];
  siteName?: MultilingualText;
  baseUrl?: string;
  canonicalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
} 