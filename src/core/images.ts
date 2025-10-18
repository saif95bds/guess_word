import type { AppConfig } from '../types/config';

/**
 * Build a srcset string for responsive images based on configured tiers
 */
/**
 * Build a srcset string for responsive images based on configured tiers
 */
export function buildSrcset(srcBase: string, config: AppConfig): string {
  const { tiers, preferFormats = ['webp', `png`] } = config.images;
  const format = preferFormats[0] || 'webp';
  
  return tiers
    .map(tier => `/assets/images/${srcBase}-${tier}.${format} ${tier}w`)
    .join(', ');
}

/**
 * Get the default src for an image (smallest tier)
 */
export function getDefaultSrc(srcBase: string, config: AppConfig): string {
  const { tiers, preferFormats = ['webp'] } = config.images;
  const format = preferFormats[0] || 'webp';
  const smallestTier = Math.min(...tiers);
  
  return `/assets/images/${srcBase}-${smallestTier}.${format}`;
}

/**
 * Get the appropriate sizes attribute for responsive images
 */
export function getSizesAttribute(maxWidth?: string): string {
  if (maxWidth) {
    return `(max-width: 768px) 100vw, ${maxWidth}`;
  }
  
  // Default responsive sizes for portrait cards
  return '(max-width: 768px) 100vw, 300px';
}

/**
 * Preload critical images for better performance
 */
export function preloadImage(srcBase: string, config: AppConfig): void {
  const src = getDefaultSrc(srcBase, config);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Check if an image exists at the given path
 */
export async function imageExists(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Get fallback image path if main image fails
 */
export function getFallbackSrc(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjQyNiIgdmlld0JveD0iMCAwIDMyMCA0MjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iNDI2IiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0xNjAgMjEzTDE2MCAyMTMiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K';
}