// .github/scripts/update-toc.js
const fs = require('fs');
const yaml = require('js-yaml');

// Read environment variables set by GitHub Actions
const commitMessage = process.env.COMMIT_MESSAGE; // e.g., "Team Info"
const newFile = process.env.NEW_FILE; // e.g., "docs/md/test.md"

if (!commitMessage || !newFile) {
  console.error("Missing COMMIT_MESSAGE or NEW_FILE environment variables.");
  process.exit(1);
}

// Extract the file base name (without directory and extension)
const path = require('path');
const fileBase = path.basename(newFile, '.md');

// Path to your _toc.yml file (adjust if needed)
const tocPath = 'docs/_toc.yml';

try {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const toc = yaml.load(tocContent);

  // Ensure toc.parts exists (assuming your toc structure uses a top-level "parts" field)
  if (!toc.parts) {
    toc.parts = [];
  }

  // Function to add the file under a part with the given caption
  function addFileToCaption(tocParts, caption, fileBase) {
    // Try to find a part with the matching caption (case-insensitive)
    let part = tocParts.find(p => p.caption.toLowerCase() === caption.toLowerCase());
    if (!part) {
      // If not found, create a new part with that caption
      part = { caption: caption, chapters: [] };
      tocParts.push(part);
    }
    // Ensure the file isn't already in the chapters
    const exists = part.chapters.some(ch => {
      if (typeof ch === 'object' && ch.file) {
        return ch.file.toLowerCase() === fileBase.toLowerCase();
      } else if (typeof ch === 'string') {
        return ch.toLowerCase() === fileBase.toLowerCase();
      }
      return false;
    });
    if (!exists) {
      // Append the new file entry (without extension)
      part.chapters.push({ file: fileBase });
    }
  }

  addFileToCaption(toc.parts, commitMessage, fileBase);

  // Write the updated TOC back to the file
  const newTocContent = yaml.dump(toc);
  fs.writeFileSync(tocPath, newTocContent, 'utf8');
  console.log(`Updated TOC with file ${fileBase} under caption "${commitMessage}"`);
} catch (err) {
  console.error("Error updating TOC:", err);
  process.exit(1);
}
