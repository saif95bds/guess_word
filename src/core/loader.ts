import type { AppConfig, Strings, Puzzle } from '../types/config';

export interface LoadedData {
  app: AppConfig;
  strings: Strings;
  puzzles: Puzzle[];
}

export class LoadError extends Error {
  public readonly file: string;
  public readonly cause?: Error;

  constructor(
    message: string,
    file: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'LoadError';
    this.file = file;
    this.cause = cause;
  }
}

/**
 * Loads and validates app configuration
 */
async function loadAppConfig(): Promise<AppConfig> {
  try {
    const response = await fetch('/data/app.config.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const config = await response.json() as AppConfig;
    
    // Basic validation
    if (!config.defaultLocale || !Array.isArray(config.enabledModes)) {
      throw new Error('Invalid config structure: missing required fields');
    }
    
    return config;
  } catch (error) {
    throw new LoadError(
      'Failed to load app configuration',
      'app.config.json',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Loads localized strings
 */
async function loadStrings(locale: string = 'nb'): Promise<Strings> {
  try {
    const response = await fetch(`/data/strings.${locale}.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const strings = await response.json() as Strings;
    
    // Basic validation
    if (!strings.ui || typeof strings.ui !== 'object') {
      throw new Error('Invalid strings structure: missing ui section');
    }
    
    return strings;
  } catch (error) {
    throw new LoadError(
      `Failed to load strings for locale: ${locale}`,
      `strings.${locale}.json`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Loads puzzle data
 */
async function loadPuzzles(locale: string = 'nb'): Promise<Puzzle[]> {
  try {
    const response = await fetch(`/data/puzzles.${locale}.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Basic validation
    if (!data.puzzles || !Array.isArray(data.puzzles)) {
      throw new Error('Invalid puzzles structure: missing puzzles array');
    }
    
    return data.puzzles as Puzzle[];
  } catch (error) {
    throw new LoadError(
      `Failed to load puzzles for locale: ${locale}`,
      `puzzles.${locale}.json`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Loads all configuration and data files
 */
export async function loadAll(locale?: string): Promise<LoadedData> {
  try {
    // Load app config first to get default locale
    const app = await loadAppConfig();
    const resolvedLocale = locale || app.defaultLocale;
    
    // Load strings and puzzles in parallel
    const [strings, puzzles] = await Promise.all([
      loadStrings(resolvedLocale),
      loadPuzzles(resolvedLocale)
    ]);
    
    return {
      app,
      strings,
      puzzles
    };
  } catch (error) {
    // Re-throw LoadError as-is, wrap others
    if (error instanceof LoadError) {
      throw error;
    }
    throw new LoadError(
      'Failed to load application data',
      'multiple files',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Validates that all required data is present
 */
export function validateLoadedData(data: LoadedData): void {
  const { app, strings, puzzles } = data;
  
  if (!app.enabledModes.includes(app.defaultMode)) {
    throw new Error(`Default mode "${app.defaultMode}" is not in enabled modes`);
  }
  
  if (!strings.ui?.title) {
    throw new Error('Missing required UI title string');
  }
  
  if (puzzles.length === 0) {
    throw new Error('No puzzles loaded');
  }
  
  // Validate first puzzle structure
  const firstPuzzle = puzzles[0];
  if (!firstPuzzle?.id || !firstPuzzle?.image1 || !firstPuzzle?.image2 || !firstPuzzle?.answer) {
    throw new Error('Invalid puzzle structure');
  }
}