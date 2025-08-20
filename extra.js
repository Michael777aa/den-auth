// extra.js
const fs = require("fs-extra");

const directoriesToCopy = [
  { source: "src/public", destination: "dist/public" },
  { source: "src/views", destination: "dist/views" }, // if you use views (EJS, etc.)
];

async function copyDirectories() {
  try {
    for (const directory of directoriesToCopy) {
      if (fs.existsSync(directory.source)) {
        await fs.copy(directory.source, directory.destination);
        console.log(`✅ Copied: ${directory.source} -> ${directory.destination}`);
      } else {
        console.warn(`⚠️ Skipped: ${directory.source} (not found)`);
      }
    }
    console.log("🎉 All directories copied successfully!");
  } catch (error) {
    console.error("❌ Error during copy:", error);
    process.exit(1);
  }
}

copyDirectories();
