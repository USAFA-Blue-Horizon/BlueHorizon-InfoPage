const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Read environment variables from GitHub Actions
const commitMessage = process.env.COMMIT_MESSAGE;  // e.g., "Team Info"
const newFile = process.env.NEW_FILE;              // e.g., "docs/md/test.md"

if (!commitMessage || !newFile) {
  console.error("❌ ERROR: Missing COMMIT_MESSAGE or NEW_FILE environment variables.");
  process.exit(1);
}

// Extract filename without extension, ensuring it uses the "md/" prefix
const fileBase = "md/" + path.basename(newFile, '.md');
console.log(`🔍 File base to add: ${fileBase}`);
console.log(`🔍 Commit message: ${commitMessage}`);

const tocPath = 'docs/_toc.yml';

try {
  const tocContent = fs.readFileSync(tocPath, 'utf8');
  const toc = yaml.load(tocContent);

  // Ensure that toc.parts exists
  if (!toc.parts) {
    toc.parts = [];
  }

  // Remove file from any existing section
  function removeFileFromOldSection(tocParts, fileBase) {
    let removedSection = null;
    for (let i = tocParts.length - 1; i >= 0; i--) {
      const part = tocParts[i];
      const newChapters = part.chapters.filter(ch => ch.file !== fileBase);
      if (newChapters.length !== part.chapters.length) {
        console.log(`❌ Removing ${fileBase} from section: ${part.caption}`);
        part.chapters = newChapters;
        if (part.chapters.length === 0) {
          removedSection = part.caption; // Mark the section for removal
        }
      }
    }

    // Remove empty sections
    if (removedSection) {
      toc.parts = toc.parts.filter(p => p.caption !== removedSection);
      console.log(`🗑️ Removed empty section: ${removedSection}`);
    }
  }

  // Function to add fileBase under a new caption
  function addFileToCaption(tocParts, caption, fileBase) {
    let part = tocParts.find(p => p.caption.toLowerCase() === caption.toLowerCase());
    if (!part) {
      console.log(`🆕 Creating new section: ${caption}`);
      part = { caption: caption, chapters: [] };
      tocParts.push(part);
    }

    // Check if fileBase already exists in this part's chapters.
    const exists = part.chapters.some(ch => ch.file === fileBase);
    if (!exists) {
      console.log(`✅ Adding ${fileBase} to section: ${caption}`);
      part.chapters.push({ file: fileBase });
    } else {
      console.log(`ℹ️ ${fileBase} already exists in section: ${caption}`);
    }
  }

  // Remove the file from any old section
  removeFileFromOldSection(toc.parts, fileBase);

  // Add it to the new section
  addFileToCaption(toc.parts, commitMessage, fileBase);

  // Write the updated TOC back to the file
  const newTocContent = yaml.dump(toc);
  fs.writeFileSync(tocPath, newTocContent, 'utf8');
  console.log(`✅ Updated TOC with ${fileBase} under "${commitMessage}"`);
} catch (err) {
  console.error("❌ ERROR updating TOC:", err);
  process.exit(1);
}
