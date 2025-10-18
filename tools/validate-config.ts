#!/usr/bin/env node
/**
 * Configuration Validator for Guess Word Game
 * 
 * Validates:
 * - JSON structure and required keys in app.config.json, strings.nb.json, puzzles.nb.json
 * - All srcBase references have corresponding image files for all configured tiers
 * - Image file sizes are within budgetKB limits
 * 
 * Usage: npm run validate
 * Exit codes: 0 = success, 1 = validation errors found
 */

import { readFileSync, statSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { AppConfig, Puzzle, Strings } from '../src/types/config.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

interface ValidationError {
  type: 'error' | 'warning';
  file: string;
  message: string;
}

const errors: ValidationError[] = [];
const warnings: ValidationError[] = [];

/**
 * Add an error to the validation results
 */
function addError(file: string, message: string): void {
  errors.push({ type: 'error', file, message });
}

/**
 * Add a warning to the validation results
 */
function addWarning(file: string, message: string): void {
  warnings.push({ type: 'warning', file, message });
}

/**
 * Load and parse a JSON file
 */
function loadJSON<T>(filePath: string): T | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    addError(filePath, `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Check if a file exists
 */
function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath: string): number {
  try {
    const stats = statSync(filePath);
    return stats.size / 1024;
  } catch {
    return 0;
  }
}

/**
 * Validate app.config.json structure
 */
function validateAppConfig(config: AppConfig | null, filePath: string): boolean {
  if (!config) return false;

  let valid = true;

  // Required top-level keys
  const requiredKeys: (keyof AppConfig)[] = [
    'defaultLocale',
    'enabledModes',
    'defaultMode',
    'timer',
    'selection',
    'input',
    'effects',
    'answerCard',
    'images'
  ];

  for (const key of requiredKeys) {
    if (!(key in config)) {
      addError(filePath, `Missing required key: ${key}`);
      valid = false;
    }
  }

  // Validate timer
  if (config.timer) {
    if (!('enabled' in config.timer)) {
      addError(filePath, 'timer.enabled is required');
      valid = false;
    }
    if (!config.timer.durations || config.timer.durations.length === 0) {
      addError(filePath, 'timer.durations must be a non-empty array');
      valid = false;
    }
    if (typeof config.timer.default !== 'number') {
      addError(filePath, 'timer.default must be a number');
      valid = false;
    }
  }

  // Validate enabled modes
  if (config.enabledModes) {
    if (!Array.isArray(config.enabledModes) || config.enabledModes.length === 0) {
      addError(filePath, 'enabledModes must be a non-empty array');
      valid = false;
    }
    if (config.defaultMode && !config.enabledModes.includes(config.defaultMode)) {
      addError(filePath, `defaultMode "${config.defaultMode}" is not in enabledModes`);
      valid = false;
    }
  }

  // Validate selection strategy
  if (config.selection) {
    const validStrategies = ['random', 'sequential', 'shuffled'];
    if (!validStrategies.includes(config.selection.strategy)) {
      addError(filePath, `selection.strategy must be one of: ${validStrategies.join(', ')}`);
      valid = false;
    }
  }

  // Validate images config
  if (config.images) {
    if (!config.images.tiers || config.images.tiers.length === 0) {
      addError(filePath, 'images.tiers must be a non-empty array');
      valid = false;
    }
    if (typeof config.images.budgetKB !== 'number' || config.images.budgetKB <= 0) {
      addError(filePath, 'images.budgetKB must be a positive number');
      valid = false;
    }
  }

  // Validate answerCard
  if (config.answerCard) {
    if (typeof config.answerCard.showImage !== 'boolean') {
      addError(filePath, 'answerCard.showImage must be a boolean');
      valid = false;
    }
    const validTransitions = ['fade', 'slide', 'none'];
    if (!validTransitions.includes(config.answerCard.transition)) {
      addError(filePath, `answerCard.transition must be one of: ${validTransitions.join(', ')}`);
      valid = false;
    }
  }

  return valid;
}

/**
 * Validate strings.nb.json structure
 */
function validateStrings(strings: Strings | null, filePath: string): boolean {
  if (!strings) return false;

  let valid = true;

  // Required top-level keys
  const requiredSections = ['ui', 'summary', 'errors', 'accessibility'];
  
  for (const section of requiredSections) {
    if (!(section in strings)) {
      addError(filePath, `Missing required section: ${section}`);
      valid = false;
    }
  }

  // Validate ui section
  if (strings.ui) {
    const requiredUIKeys = ['title', 'submit', 'exit', 'replay', 'changeMode', 'placeholder'];
    for (const key of requiredUIKeys) {
      if (!(key in strings.ui)) {
        addError(filePath, `Missing required ui.${key}`);
        valid = false;
      }
    }
  }

  // Validate summary section
  if (strings.summary) {
    const requiredSummaryKeys = ['title', 'scoreText'];
    for (const key of requiredSummaryKeys) {
      if (!(key in strings.summary)) {
        addError(filePath, `Missing required summary.${key}`);
        valid = false;
      }
    }
  }

  return valid;
}

/**
 * Validate puzzles.nb.json structure
 */
function validatePuzzles(data: { puzzles: Puzzle[] } | null, filePath: string): boolean {
  if (!data) return false;

  let valid = true;

  if (!data.puzzles || !Array.isArray(data.puzzles)) {
    addError(filePath, 'Missing or invalid "puzzles" array');
    return false;
  }

  if (data.puzzles.length === 0) {
    addError(filePath, 'puzzles array is empty');
    return false;
  }

  data.puzzles.forEach((puzzle, index) => {
    const prefix = `puzzles[${index}]`;

    // Required keys
    if (!puzzle.id) {
      addError(filePath, `${prefix}: missing id`);
      valid = false;
    }
    if (!puzzle.answer) {
      addError(filePath, `${prefix}: missing answer`);
      valid = false;
    }

    // Validate image1
    if (!puzzle.image1) {
      addError(filePath, `${prefix}: missing image1`);
      valid = false;
    } else {
      if (!puzzle.image1.srcBase) {
        addError(filePath, `${prefix}.image1: missing srcBase`);
        valid = false;
      }
      if (!puzzle.image1.wordPart) {
        addError(filePath, `${prefix}.image1: missing wordPart`);
        valid = false;
      }
    }

    // Validate image2
    if (!puzzle.image2) {
      addError(filePath, `${prefix}: missing image2`);
      valid = false;
    } else {
      if (!puzzle.image2.srcBase) {
        addError(filePath, `${prefix}.image2: missing srcBase`);
        valid = false;
      }
      if (!puzzle.image2.wordPart) {
        addError(filePath, `${prefix}.image2: missing wordPart`);
        valid = false;
      }
    }

    // Validate answerImage
    if (!puzzle.answerImage) {
      addError(filePath, `${prefix}: missing answerImage`);
      valid = false;
    } else {
      if (!puzzle.answerImage.srcBase) {
        addError(filePath, `${prefix}.answerImage: missing srcBase`);
        valid = false;
      }
      if (!puzzle.answerImage.word) {
        addError(filePath, `${prefix}.answerImage: missing word`);
        valid = false;
      }
    }
  });

  return valid;
}

/**
 * Validate that image files exist for all tiers
 */
function validateImageFiles(
  srcBases: string[],
  config: AppConfig,
  publicDir: string
): void {
  const { tiers, preferFormats = ['webp'], budgetKB } = config.images;
  const imagesDir = join(publicDir, 'assets', 'images');

  for (const srcBase of srcBases) {
    for (const tier of tiers) {
      let found = false;
      let checkedFormats: string[] = [];

      // Check each format in order of preference
      for (const format of preferFormats) {
        const filename = `${srcBase}-${tier}.${format}`;
        const filepath = join(imagesDir, filename);
        checkedFormats.push(format);

        if (fileExists(filepath)) {
          found = true;
          
          // Check file size
          const sizeKB = getFileSizeKB(filepath);
          if (sizeKB > budgetKB) {
            addWarning(
              'images',
              `${filename} exceeds budget: ${sizeKB.toFixed(2)}KB > ${budgetKB}KB`
            );
          }
          break; // Found a valid format
        }
      }

      if (!found) {
        addError(
          'images',
          `Missing image file for "${srcBase}" at tier ${tier}. Checked formats: ${checkedFormats.join(', ')}`
        );
      }
    }
  }
}

/**
 * Collect all srcBase values from puzzles
 */
function collectSrcBases(puzzles: Puzzle[]): string[] {
  const srcBases = new Set<string>();

  for (const puzzle of puzzles) {
    if (puzzle.image1?.srcBase) {
      srcBases.add(puzzle.image1.srcBase);
    }
    if (puzzle.image2?.srcBase) {
      srcBases.add(puzzle.image2.srcBase);
    }
    if (puzzle.answerImage?.srcBase) {
      srcBases.add(puzzle.answerImage.srcBase);
    }
  }

  return Array.from(srcBases);
}

/**
 * Print validation results
 */
function printResults(): void {
  console.log('\n' + colors.bold + colors.blue + '='.repeat(60) + colors.reset);
  console.log(colors.bold + colors.blue + 'Configuration Validation Results' + colors.reset);
  console.log(colors.bold + colors.blue + '='.repeat(60) + colors.reset + '\n');

  if (errors.length === 0 && warnings.length === 0) {
    console.log(colors.green + '✓ All validations passed!' + colors.reset);
    console.log(colors.green + '  No errors or warnings found.\n' + colors.reset);
    return;
  }

  // Print errors
  if (errors.length > 0) {
    console.log(colors.bold + colors.red + `✗ ${errors.length} Error(s) Found:\n` + colors.reset);
    errors.forEach((error, index) => {
      console.log(colors.red + `  ${index + 1}. [${error.file}]` + colors.reset);
      console.log(`     ${error.message}\n`);
    });
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log(colors.bold + colors.yellow + `⚠ ${warnings.length} Warning(s) Found:\n` + colors.reset);
    warnings.forEach((warning, index) => {
      console.log(colors.yellow + `  ${index + 1}. [${warning.file}]` + colors.reset);
      console.log(`     ${warning.message}\n`);
    });
  }

  // Summary
  console.log(colors.bold + colors.blue + '='.repeat(60) + colors.reset);
  if (errors.length > 0) {
    console.log(colors.red + 'Validation FAILED' + colors.reset);
  } else {
    console.log(colors.green + 'Validation PASSED (with warnings)' + colors.reset);
  }
  console.log(colors.bold + colors.blue + '='.repeat(60) + colors.reset + '\n');
}

/**
 * Main validation function
 */
function main(): void {
  console.log(colors.cyan + '\nStarting configuration validation...\n' + colors.reset);

  const rootDir = resolve(join(process.cwd()));
  const publicDir = join(rootDir, 'public');
  const dataDir = join(publicDir, 'data');

  // File paths
  const appConfigPath = join(dataDir, 'app.config.json');
  const stringsPath = join(dataDir, 'strings.nb.json');
  const puzzlesPath = join(dataDir, 'puzzles.nb.json');

  // Check if files exist
  console.log(colors.cyan + '1. Checking file existence...' + colors.reset);
  [appConfigPath, stringsPath, puzzlesPath].forEach(path => {
    if (!fileExists(path)) {
      addError(path, 'File does not exist');
    } else {
      console.log(colors.green + `   ✓ ${path}` + colors.reset);
    }
  });

  // Load configs
  console.log(colors.cyan + '\n2. Loading configuration files...' + colors.reset);
  const appConfig = loadJSON<AppConfig>(appConfigPath);
  const strings = loadJSON<Strings>(stringsPath);
  const puzzlesData = loadJSON<{ puzzles: Puzzle[] }>(puzzlesPath);

  // Validate structure
  console.log(colors.cyan + '\n3. Validating JSON structure...' + colors.reset);
  validateAppConfig(appConfig, 'app.config.json');
  validateStrings(strings, 'strings.nb.json');
  validatePuzzles(puzzlesData, 'puzzles.nb.json');

  // Validate images
  if (appConfig && puzzlesData?.puzzles) {
    console.log(colors.cyan + '\n4. Validating image files...' + colors.reset);
    const srcBases = collectSrcBases(puzzlesData.puzzles);
    console.log(colors.cyan + `   Found ${srcBases.length} unique image(s) to validate` + colors.reset);
    validateImageFiles(srcBases, appConfig, publicDir);
  }

  // Print results
  printResults();

  // Exit with appropriate code
  process.exit(errors.length > 0 ? 1 : 0);
}

// Run validation
main();
