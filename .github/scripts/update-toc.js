const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Read environment variables from process.env
const commitMessage = process.env.COMMIT_MESSAGE;  // e.g., "Team Info"
const newFile = process.env.NEW_FILE;              // e.g., "docs/md/test.md"

if (!commitMessage || !newFile) {
  console.error("❌ ERROR: Missing COMMIT_MESSAGE or NEW_FILE environment variables.");
  process.exit(1);
}

// Extract the file base name and ensure it has the "md/" prefix
const fileBase = "md/" + path.basename(newFile, '.md');
console.log(`🔍 File base to add: ${fileBase}`);
console.log(`🔍 Commit message: ${commitMessage}`);

// Path to your _toc.yml file
const tocPath = 'docs/_toc.yml';

try {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const toc = yaml.load(tocContent);

  // Ensure that toc.parts exists (assuming your TOC uses a top-level 'parts' field)
  if (!toc.parts) {
    toc.parts = [];
  }

  // Function to add fileBase under a given caption (case-insensitive)
  function addFileToCaption(tocParts, caption, fileBase) {
    let part = tocParts.find(p => p.caption.toLowerCase() === caption.toLowerCase());
    if (!part) {
      console.log(`🆕 Creating new section: ${caption}`);
      part = { caption: caption, chapters: [] };
      tocParts.push(part);
    }

    // Check if fileBase is already present
    const exists = part.chapters.some(ch => {
      if (typeof ch === 'object' && ch.file) {
        return ch.file.toLowerCase() === fileBase.toLowerCase();
      } else if (typeof ch === 'string') {
        return ch.toLowerCase() === fileBase.toLowerCase();
      }
      return false;
    });

    if (!exists) {
      console.log(`✅ Adding ${fileBase} to section: ${caption}`);
      part.chapters.push({ file: fileBase });
    } else {
      console.log(`ℹ️ ${fileBase} already exists in section: ${caption}`);
    }
  }

  addFileToCaption(toc.parts, commitMessage, fileBase);

  // Write the updated TOC back to the file
  const newTocContent = yaml.dump(toc);
  fs.writeFileSync(tocPath, newTocContent, 'utf8');
  console.log(`✅ Updated TOC with ${fileBase} under "${commitMessage}"`);
} catch (err) {
  console.error("❌ ERROR updating TOC:", err);
  process.exit(1);
}
