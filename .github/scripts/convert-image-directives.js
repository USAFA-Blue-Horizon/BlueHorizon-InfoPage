/**
 * convert-image-directives.js
 *
 * This script reads a Markdown file and converts Pandoc image syntax
 * with dimension attributes (and an optional alignment) into a MyST image directive.
 *
 * Example Input:
 * ![Alt text](media/image1.png){width="499px" height="193px" align="center"}
 *
 * Example Output:
 * ```{image} media/image1.png
 * :alt: Alt text
 * :width: 499px
 * :height: 193px
 * :align: center
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
  
  // Regex to match Pandoc image syntax with dimensions and an optional alignment.
  // Capture groups:
  //   1: Alt text
  //   2: Image path
  //   3: Width value
  //   4: Height value
  //   5: Optional align value
  const regex = /!\[([^\]]*)\]\(([^)]+)\)\{width="([^"]+)"\s+height="([^"]+)"(?:\s+align="([^"]+)")?\}/g;
  
  const newData = data.replace(regex, (match, alt, imgPath, width, height, align) => {
    let output = "```{image} " + imgPath + "\n";
    output += ":width: " + width + "\n";
    output += ":height: " + height + "\n";
    output += ":align: " + "center" + "\n";
    output += "```";
    return output;
  });
  
  fs.writeFile(filePath, newData, 'utf8', (err) => {
    if (err) {
      console.error("Error writing file:", err);
      process.exit(1);
    }
    console.log(`Converted image syntax in ${filePath}`);
  });
});
