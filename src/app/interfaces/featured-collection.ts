import { IArchived } from "./archive.interface";

export interface ICollectionItem {
    title: string;
    description: string;
    image: IArchived;
    buttonText: string;
    buttonLink: string;
    queryParams: { [key: string]: string };
  }
  
  export interface IFeaturedCollection {
    _id: string;
    sectionSubtitle: string;
    sectionTitle: string;
    description: string;
    collections: ICollectionItem[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } 