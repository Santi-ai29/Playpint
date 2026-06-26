const { spawnSync } = require("node:child_process");
const { existsSync, readdirSync, statSync } = require("node:fs");
const { join } = require("node:path");

const testRoots = [
  join(__dirname, "..", "dist", "packages"),
  join(__dirname, "..", "dist", "apps"),
];

function findTests(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return findTests(fullPath);
    }

    return entry.endsWith(".test.js") ? [fullPath] : [];
  });
}

const testFiles = testRoots.flatMap(findTests);

if (testFiles.length === 0) {
  console.error("No compiled test files found in dist.");
  process.exit(1);
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
