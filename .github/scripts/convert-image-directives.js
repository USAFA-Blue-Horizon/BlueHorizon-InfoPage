/**
 * convert-image-directives.js
 *
 * This script reads a Markdown file and converts Pandoc image syntax
 * with dimension attributes into a MyST image directive.
 *
 * Example Input:
 * ![Alt text](media/image1.png){width="499px" height="193px"}
 *
 * Example Output:
 * ```{image} media/image1.png
 * :alt: Alt text
 * :width: 499px
 * :height: 193px
 * ```
 */

const fs = require('fs');

if (process.argv.length < 3) {
  console.error("Usage: node convert-image-directives.js <path-to-markdown-file>");
  process.exit(1);
}

const filePath = process.argv[2];

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    process.exit(1);
  }
  
  // Regex to match Pandoc image syntax with dimensions.
  // Capture groups:
  // 1: Alt text
  // 2: Image path
  // 3: Width value (including "px" if present, or with "in")
  // 4: Height value
  const regex = /!\[([^\]]*)\]\(([^)]+)\)\{width="([^"]+)"\s+height="([^"]+)"\}/g;
  
  const newData = data.replace(regex, (match, alt, imgPath, width, height) => {
    // Optionally, you could convert inch values to pixels here if they end with "in".
    // For now, we assume width and height are already in px (if not, you can adjust below).
    // Remove any extraneous quotes if needed.
    return "```{image} " + imgPath + "\n:width: " + width + "\n:height: " + height + "\n```";
  });
  
  fs.writeFile(filePath, newData, 'utf8', (err) => {
    if (err) {
      console.error("Error writing file:", err);
      process.exit(1);
    }
    console.log(`Converted image syntax in ${filePath}`);
  });
});
