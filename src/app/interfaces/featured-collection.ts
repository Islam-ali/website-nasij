import { IArchived } from "./archive.interface";
import { MultilingualText } from "../core/models/multi-language";

export interface ICollectionItem {
    title: MultilingualText;
    description: MultilingualText;
    image: IArchived;
    buttonText: MultilingualText;
    buttonLink: string;
    queryParams: { [key: string]: string };
  }
  
  export interface IFeaturedCollection {
    _id: string;
    sectionSubtitle: MultilingualText;
    sectionTitle: MultilingualText;
    description: MultilingualText;
    collections: ICollectionItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } 