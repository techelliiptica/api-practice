/**
 * Cross-platform install for backend, backend-products, and frontend.
 * Used by postinstall / install:all (avoids Windows issues with && and --prefix).
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const packages = ["backend", "backend-products", "frontend"];

if (process.env.SKIP_POSTINSTALL === "1") {
  console.log("SKIP_POSTINSTALL=1 — skipping sub-package installs.");
  process.exit(0);
}

for (const name of packages) {
  const dir = path.join(root, name);

  if (!fs.existsSync(dir)) {
    console.error(`\nMissing folder: ${name}/`);
    console.error("Make sure you cloned the full repo (including backend-products/).");
    process.exit(1);
  }

  if (!fs.existsSync(path.join(dir, "package.json"))) {
    console.error(`\nMissing ${name}/package.json`);
    process.exit(1);
  }

  console.log(`\n>>> npm install in ${name}/`);
  try {
    execSync("npm install", {
      cwd: dir,
      stdio: "inherit",
      env: process.env,
      // shell: true helps on Windows (cmd/PowerShell) and paths with spaces
      shell: true
    });
  } catch (err) {
    console.error(`\nFailed to install dependencies in ${name}/`);
    console.error("Try manually: cd " + name + " && npm install");
    process.exit(1);
  }
}

console.log("\nAll packages installed successfully.\n");
