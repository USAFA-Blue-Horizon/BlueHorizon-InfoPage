/**
 * convert-dimensions.js
 *
 * This script reads a Markdown file and replaces image dimension attributes
 * from inches to pixels using 96 DPI.
 *
 * Usage:
 *   node .github/scripts/convert-dimensions.js <path-to-markdown-file>
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error("Usage: node convert-dimensions.js <path-to-markdown-file>");
  process.exit(1);
}

const filePath = process.argv[2];
const dpi = 96;

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    process.exit(1);
  }
  // This regex matches {width="Xin" height="Yin"} allowing for optional spaces.
  const regex = /\{width="([0-9.]+)in"\s+height="([0-9.]+)in"\}/g;
  const newData = data.replace(regex, (match, widthIn, heightIn) => {
    const widthPx = Math.round(parseFloat(widthIn) * dpi);
    const heightPx = Math.round(parseFloat(heightIn) * dpi);
    return `{width="${widthPx}" height="${heightPx}"}`;
  });
  fs.writeFile(filePath, newData, 'utf8', (err) => {
    if (err) {
      console.error("Error writing file:", err);
      process.exit(1);
    }
    console.log(`Converted dimensions in ${filePath}`);
  });
});
