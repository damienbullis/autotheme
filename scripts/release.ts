import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

function exec(cmd: string): void {
  execSync(cmd, { stdio: "inherit" });
}

// --- Parse flags ---
const args = process.argv.slice(2);
let dryRun = false;
let version: string | undefined;

for (const arg of args) {
  if (arg === "--dry-run") {
    dryRun = true;
  } else if (!arg.startsWith("-")) {
    version = arg;
  }
}

if (!version || !SEMVER_RE.test(version)) {
  console.error("Usage: bun run scripts/release.ts [--dry-run] <version>");
  console.error("  version must be semver (e.g. 1.0.0, 1.0.0-beta.1)");
  process.exit(1);
}

const isPrerelease = version.includes("-");

function dryExec(cmd: string, description: string): void {
  if (dryRun) {
    console.log(`[dry-run] ${description}: ${cmd}`);
  } else {
    exec(cmd);
  }
}

// --- Check git working directory is clean ---
const status = run("git status --porcelain");
if (status) {
  console.error("Error: git working directory is not clean.");
  console.error(status);
  process.exit(1);
}

// --- Validate changelog has entry for this version (skip for pre-releases) ---
if (!isPrerelease) {
  const changelogPath = resolve(import.meta.dirname, "..", "CHANGELOG.md");
  const changelog = readFileSync(changelogPath, "utf-8");
  const versionHeadingRe = new RegExp(`^## \\[${version.replace(/\./g, "\\.")}\\]`, "m");
  if (!versionHeadingRe.test(changelog)) {
    console.error(`Error: CHANGELOG.md has no entry for version ${version}.`);
    console.error(`Add a "## [${version}] - YYYY-MM-DD" section before releasing.`);
    process.exit(1);
  }
}

// --- Run checks ---
console.log("Running checks...");
if (!dryRun) {
  exec("bun run check");
} else {
  console.log("[dry-run] Would run: bun run check");
}

// --- Update package.json version ---
const pkgPath = resolve(import.meta.dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const previousVersion = pkg.version;
pkg.version = version;

if (dryRun) {
  console.log(`[dry-run] Would update package.json version: ${previousVersion} -> ${version}`);
} else {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(`Updated package.json version to ${version}`);
}

// --- Build ---
console.log("Building...");
dryExec("bun run build", "Build library, CLI, types, and schema");

// --- Build local binary ---
console.log("Building local binary...");
dryExec("bun run build:binary", "Build platform binaries");

// --- Git commit and tag ---
console.log("Creating git commit and tag...");
dryExec("git add package.json", "Stage package.json");
dryExec(`git commit -m "release: v${version}"`, "Commit version bump");
dryExec(`git tag -a "v${version}" -m "v${version}"`, "Create git tag");

// --- Summary ---
console.log("");
if (dryRun) {
  console.log(`[dry-run] Release v${version} would be prepared. No changes were made.`);
} else {
  console.log(`Release v${version} prepared. Next steps:`);
}

console.log("");
console.log("  git push origin main");
console.log(`  git push origin v${version}`);
console.log("");
console.log("This will trigger the release workflow which will:");
console.log("  1. Run tests");
console.log("  2. Build binaries for all platforms");
console.log("  3. Generate checksums");
console.log("  4. Publish to npm");
if (isPrerelease) {
  console.log("  5. Create GitHub pre-release (draft)");
} else {
  console.log("  5. Create GitHub release");
}
console.log("");
