import { MultilingualText } from '../../../core/models/multi-language';

/**
 * Utility functions for converting variant data between different formats
 */

/**
 * Convert variant data from string format to multilingual format
 * @param variantData - Array of variant objects with string values
 * @returns Array of variant objects with multilingual values
 */
export function convertVariantsToMultilingual(variantData: any[]): any[] {
  return variantData.map(variant => ({
    ...variant,
    value: {
      en: variant.value || '',
      ar: variant.value || ''
    }
  }));
}

/**
 * Convert variant data from multilingual format to string format
 * @param variantData - Array of variant objects with multilingual values
 * @param language - Language to extract (default: 'en')
 * @returns Array of variant objects with string values
 */
export function convertVariantsToString(variantData: any[], language: 'en' | 'ar' = 'en'): any[] {
  return variantData.map(variant => ({
    ...variant,
    value: variant.value?.[language] || variant.value || ''
  }));
}

/**
 * Ensure variant value is in multilingual format
 * @param value - Value that could be string or multilingual object
 * @returns MultilingualText object
 */
export function ensureMultilingualValue(value: string | MultilingualText): MultilingualText {
  if (typeof value === 'string') {
    return {
      en: value,
      ar: value
    };
  }
  
  if (value && typeof value === 'object') {
    return {
      en: value.en || '',
      ar: value.ar || ''
    };
  }
  
  return {
    en: '',
    ar: ''
  };
}

/**
 * Get display value from multilingual variant value
 * @param value - MultilingualText object
 * @param language - Language to display (default: 'en')
 * @returns String value for display
 */
export function getVariantDisplayValue(value: MultilingualText, language: 'en' | 'ar' = 'en'): string {
  if (!value) return '';
  return value[language] || value.en || value.ar || '';
}