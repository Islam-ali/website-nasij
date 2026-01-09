import { IArchived } from "./archive.interface";
import { MultilingualText } from "../core/models/multi-language";
import { IProfessionalGridConfig } from './professional-grid.interface';

export interface IResponsiveGridConfig {
  sm: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface IResponsiveFlexConfig {
  grow?: number;
  shrink?: number;
  basis?: string;
  mdGrow?: number;
  mdShrink?: number;
  mdBasis?: string;
  lgGrow?: number;
  lgShrink?: number;
  lgBasis?: string;
  xlGrow?: number;
  xlShrink?: number;
  xlBasis?: string;
}

export interface IGridConfig {
  gridCols: IResponsiveGridConfig;
  gridRows?: IResponsiveGridConfig;
  colSpans?: IResponsiveGridConfig[];
  rowSpans?: IResponsiveGridConfig[];
  flexConfigs?: IResponsiveFlexConfig[];
  gap?: number;
  rowHeight?: string;
  layoutType?: 'grid' | 'flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
  heightMode?: 'auto' | 'fixed' | 'min' | 'max' | 'aspect-ratio';
  height?: string;
  aspectRatio?: string;
  width?: string;
  parentCustomStyle?: string;
  itemsCustomStyle?: string[]; // Changed to string array for Tailwind classes
  heroGrid?: IProfessionalGridConfig; // New Professional Grid Config
}

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
    gridConfig: IGridConfig;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } 