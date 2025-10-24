#!/usr/bin/env node

/**
 * Script to rename Norwegian image filenames to English equivalents
 * This avoids URL encoding issues with Norwegian special characters (æ, ø, å)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Directories to process
const ASSETS_DIR = path.join(projectRoot, 'public/assets/images');
const ORIGINAL_DIR = path.join(projectRoot, 'Original_pictures');

// Mapping from Norwegian to English
const MAPPINGS = {
  'skole': 'school',
  'buss': 'bus',
  'skolebuss': 'schoolbus',
  'sol': 'sun',
  'skinn': 'shine',
  'solskinn': 'sunshine',
  'regn': 'rain',
  'jakke': 'jacket',
  'regnjakke': 'rainjacket',
  'fisk': 'fish',
  'bolle': 'ball',
  'fiskebolle': 'fishball',
  'tann': 'tooth',
  'børste': 'brush',
  'tannbørste': 'toothbrush',
  'bok': 'book',
  'hylle': 'shelf',
  'bokhylle': 'bookshelf',
  'hånd': 'hand',
  'ball': 'ball',
  'håndball': 'handball',
  'fot': 'foot',
  'fotball': 'football',
  'snø': 'snow',
  'mann': 'man',
  'snømann': 'snowman',
  'is': 'ice',
  'krem': 'cream',
  'iskrem': 'icecream',
  'jord': 'earth',
  'bar': 'berry',
  'jordbær': 'strawberry',
  'melk': 'milk',
  'sjokolade': 'chocolate',
  'melkesjokolade': 'milkchocolate',
  'fugl': 'bird',
  'sang': 'song',
  'fuglesang': 'birdsong',
  'kjøkken': 'kitchen',
  'bord': 'table',
  'kjøkkenbord': 'kitchentable',
  'barn': 'child',
  'hage': 'garden',
  'barnehage': 'kindergarten',
  'tog': 'train',
  'spor': 'track',
  'togspor': 'traintrack',
  'sykkel': 'bicycle',
  'hjelm': 'helmet',
  'sykkelhjelm': 'bicyclehelmet',
  'katt': 'cat',
  'unge': 'kitten',
  'kattunge': 'kitten',
  'vinter': 'winter',
  'vinterjakke': 'winterjacket',
  'data': 'computer',
  'maskin': 'machine',
  'datamaskin': 'computer'
};

/**
 * Rename files in a directory
 */
function renameInDirectory(dir) {
  console.log(`\n\x1b[33mProcessing directory: ${dir}\x1b[0m`);
  
  if (!fs.existsSync(dir)) {
    console.log(`\x1b[31mDirectory not found: ${dir}\x1b[0m`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  let count = 0;
  let skipped = 0;
  
  // Process each mapping
  for (const [norwegian, english] of Object.entries(MAPPINGS)) {
    // Find files that start with the Norwegian word
    const matchingFiles = files.filter(file => {
      const baseName = path.basename(file, path.extname(file));
      return baseName.startsWith(norwegian + '-') || baseName === norwegian;
    });
    
    for (const file of matchingFiles) {
      const oldPath = path.join(dir, file);
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      
      // Replace Norwegian prefix with English
      let newBaseName = baseName;
      if (baseName.startsWith(norwegian + '-')) {
        newBaseName = english + baseName.substring(norwegian.length);
      } else if (baseName === norwegian) {
        newBaseName = english;
      }
      
      const newFile = newBaseName + ext;
      const newPath = path.join(dir, newFile);
      
      // Skip if it's already the correct name
      if (oldPath === newPath) {
        continue;
      }
      
      // Check if target already exists
      if (fs.existsSync(newPath)) {
        console.log(`  \x1b[33m⚠ Skipped (target exists): ${file} → ${newFile}\x1b[0m`);
        skipped++;
      } else {
        // Rename the file
        fs.renameSync(oldPath, newPath);
        console.log(`  \x1b[32m✓ Renamed: ${file} → ${newFile}\x1b[0m`);
        count++;
      }
    }
  }
  
  console.log(`\x1b[32m✓ Renamed ${count} files in ${dir}\x1b[0m`);
  if (skipped > 0) {
    console.log(`\x1b[33m⚠ Skipped ${skipped} files (target already exists)\x1b[0m`);
  }
}

// Main execution
console.log('\x1b[33m========================================\x1b[0m');
console.log('\x1b[33mImage File Renaming Script\x1b[0m');
console.log('\x1b[33mNorwegian → English\x1b[0m');
console.log('\x1b[33m========================================\x1b[0m');

// Rename files in assets directory
renameInDirectory(ASSETS_DIR);

// Rename files in original pictures directory  
renameInDirectory(ORIGINAL_DIR);

console.log('\n\x1b[32m========================================\x1b[0m');
console.log('\x1b[32m✓ Renaming complete!\x1b[0m');
console.log('\x1b[32m========================================\x1b[0m');
console.log('\n\x1b[33mNext steps:\x1b[0m');
console.log('  1. Run: npm run validate');
console.log('  2. Test the application');
console.log('  3. Commit changes if everything works');
