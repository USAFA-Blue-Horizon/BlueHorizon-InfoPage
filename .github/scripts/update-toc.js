const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Read environment variables
const commitMessage = process.env.COMMIT_MESSAGE;  // e.g., "Team Info"
const newFile = process.env.NEW_FILE;  // e.g., "docs/md/test.md"

if (!commitMessage || !newFile) {
  console.error("❌ ERROR: Missing COMMIT_MESSAGE or NEW_FILE environment variables.");
  process.exit(1);
}

// Extract the base filename without extension
const fileBase = "md/" + path.basename(newFile, '.md');  // Ensure md/ prefix

// Path to the _toc.yml file
const tocPath = 'docs/_toc.yml';

try {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const toc = yaml.load(tocContent);

  // Ensure `parts` exists
  if (!toc.parts) {
    toc.parts = [];
  }

  // Function to add the file under the correct caption
  function addFileToCaption(tocParts, caption, fileBase) {
    let part = tocParts.find(p => p.caption.toLowerCase() === caption.toLowerCase());
    if (!part) {
      console.log(`🆕 Creating new section: ${caption}`);
      part = { caption: caption, chapters: [] };
      tocParts.push(part);
    }

    // Ensure the file isn't already in the TOC
    const exists = part.chapters.some(ch => ch.file === fileBase);
    if (!exists) {
      console.log(`✅ Adding ${fileBase} to section: ${caption}`);
      part.chapters.push({ file: fileBase });
    }
  }

  addFileToCaption(toc.parts, commitMessage, fileBase);

  // Write the updated TOC back
  const newTocContent = yaml.dump(toc);
  fs.writeFileSync(tocPath, newTocContent, 'utf8');
  console.log(`✅ Updated TOC with ${fileBase} under "${commitMessage}"`);

} catch (err) {
  console.error("❌ ERROR updating TOC:", err);
  process.exit(1);
}
