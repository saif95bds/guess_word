import type { Strings } from '../types/config';

let loadedStrings: Strings = {};

/**
 * Initialize the strings module with loaded string data
 */
export function initStrings(strings: Strings): void {
  loadedStrings = strings;
}

/**
 * Get a localized string by key path with optional parameter substitution
 * 
 * @param key - Dot-separated path to the string (e.g., 'ui.title', 'summary.scoreText')
 * @param params - Optional parameters for string interpolation
 * @returns The localized string with parameters substituted
 */
export function getString(key: string, params?: Record<string, string | number>): string {
  const value = getNestedValue(loadedStrings, key);
  
  if (typeof value !== 'string') {
    console.warn(`String not found for key: ${key}`);
    return `[${key}]`; // Return key in brackets as fallback
  }
  
  // Replace parameters if provided
  if (params) {
    return interpolateString(value, params);
  }
  
  return value;
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

/**
 * Replace template variables in a string with provided parameters
 * Supports {{variable}} syntax
 */
function interpolateString(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Check if strings have been initialized
 */
export function isInitialized(): boolean {
  return Object.keys(loadedStrings).length > 0;
}

/**
 * Get all strings for a specific section
 */
export function getStringsSection(section: string): Record<string, any> {
  const sectionData = getNestedValue(loadedStrings, section);
  return sectionData || {};
}