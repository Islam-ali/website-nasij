/**
 * Professional Grid System Interfaces (Website)
 * Simplified version for rendering
 */

/**
 * Generic responsive value type
 */
export interface Responsive<T> {
  base?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

/**
 * Grid item configuration
 */
export interface IGridItemConfig {
  colSpan?: Responsive<number>;
  rowSpan?: Responsive<number>;
  customClass?: string;
}

/**
 * Professional Grid Configuration
 */
export interface IProfessionalGridConfig {
  columns?: Responsive<number>;
  rows?: Responsive<number>;
  rowHeight?: Responsive<string>;
  gap?: number;
  items?: IGridItemConfig[];
  wrapperClass?: string;
  justifyContent?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
}




