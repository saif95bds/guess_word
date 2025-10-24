#!/bin/bash

# Script to rename Norwegian image filenames to English equivalents
# This avoids URL encoding issues with Norwegian special characters (æ, ø, å)

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories to process
ASSETS_DIR="public/assets/images"
ORIGINAL_DIR="Original_pictures"

# Declare associative array for mappings
declare -A MAPPINGS=(
    ["skole"]="school"
    ["buss"]="bus"
    ["skolebuss"]="schoolbus"
    ["sol"]="sun"
    ["skinn"]="shine"
    ["solskinn"]="sunshine"
    ["regn"]="rain"
    ["jakke"]="jacket"
    ["regnjakke"]="rainjacket"
    ["fisk"]="fish"
    ["bolle"]="ball"
    ["fiskebolle"]="fishball"
    ["tann"]="tooth"
    ["børste"]="brush"
    ["tannbørste"]="toothbrush"
    ["bok"]="book"
    ["hylle"]="shelf"
    ["bokhylle"]="bookshelf"
    ["hånd"]="hand"
    ["ball"]="ball"
    ["håndball"]="handball"
    ["fot"]="foot"
    ["fotball"]="football"
    ["snø"]="snow"
    ["mann"]="man"
    ["snømann"]="snowman"
    ["is"]="ice"
    ["krem"]="cream"
    ["iskrem"]="icecream"
    ["jord"]="earth"
    ["bar"]="berry"
    ["jordbær"]="strawberry"
    ["melk"]="milk"
    ["sjokolade"]="chocolate"
    ["melkesjokolade"]="milkchocolate"
    ["fugl"]="bird"
    ["sang"]="song"
    ["fuglesang"]="birdsong"
    ["kjøkken"]="kitchen"
    ["bord"]="table"
    ["kjøkkenbord"]="kitchentable"
    ["barn"]="child"
    ["hage"]="garden"
    ["barnehage"]="kindergarten"
    ["tog"]="train"
    ["spor"]="track"
    ["togspor"]="traintrack"
    ["sykkel"]="bicycle"
    ["hjelm"]="helmet"
    ["sykkelhjelm"]="bicyclehelmet"
    ["katt"]="cat"
    ["unge"]="kitten"
    ["kattunge"]="kitten"
    ["vinter"]="winter"
    ["vinterjakke"]="winterjacket"
    ["data"]="computer"
    ["maskin"]="machine"
    ["datamaskin"]="computer"
)

# Function to rename files in a directory
rename_in_directory() {
    local dir=$1
    echo -e "${YELLOW}Processing directory: $dir${NC}"
    
    if [ ! -d "$dir" ]; then
        echo -e "${RED}Directory not found: $dir${NC}"
        return 1
    fi
    
    local count=0
    local skipped=0
    
    # Process each mapping
    for norwegian in "${!MAPPINGS[@]}"; do
        local english="${MAPPINGS[$norwegian]}"
        
        # Find all files matching the Norwegian pattern
        shopt -s nullglob
        for file in "$dir"/${norwegian}-*.webp "$dir"/${norwegian}-*.png "$dir"/${norwegian}-*.svg "$dir"/${norwegian}-*.avif "$dir"/${norwegian}-*.jpg "$dir"/${norwegian}-*.jpeg; do
            if [ -f "$file" ]; then
                # Extract the filename without directory
                local basename=$(basename "$file")
                
                # Create new filename by replacing Norwegian with English
                local newname=$(echo "$basename" | sed "s/^${norwegian}-/${english}-/")
                local newpath="$dir/$newname"
                
                # Check if target already exists
                if [ -f "$newpath" ]; then
                    echo -e "${YELLOW}  ⚠ Skipped (target exists): $basename → $newname${NC}"
                    ((skipped++))
                else
                    # Rename the file
                    mv "$file" "$newpath"
                    echo -e "${GREEN}  ✓ Renamed: $basename → $newname${NC}"
                    ((count++))
                fi
            fi
        done
        shopt -u nullglob
    done
    
    echo -e "${GREEN}✓ Renamed $count files in $dir${NC}"
    if [ $skipped -gt 0 ]; then
        echo -e "${YELLOW}⚠ Skipped $skipped files (target already exists)${NC}"
    fi
    echo ""
}

# Main execution
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Image File Renaming Script${NC}"
echo -e "${YELLOW}Norwegian → English${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}This will rename image files in:${NC}"
echo "  1. $ASSETS_DIR"
echo "  2. $ORIGINAL_DIR"
echo ""
echo -e "${YELLOW}Continue? (y/n)${NC}"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 0
fi

echo ""

# Rename files in assets directory
rename_in_directory "$ASSETS_DIR"

# Rename files in original pictures directory
rename_in_directory "$ORIGINAL_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Renaming complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run: npm run validate"
echo "  2. Test the application"
echo "  3. Commit changes if everything works"
