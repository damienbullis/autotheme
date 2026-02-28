import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf-8", stdio: "pipe" }).trim();
}

function exec(cmd: string): void {
  execSync(cmd, { stdio: "inherit" });
}

// --- Validate version argument ---
const version = process.argv[2];
if (!version || !SEMVER_RE.test(version)) {
  console.error("Usage: bun run scripts/release.ts <version>");
  console.error("  version must be semver (e.g. 1.0.0)");
  process.exit(1);
}

// --- Check git working directory is clean ---
const status = run("git status --porcelain");
if (status) {
  console.error("Error: git working directory is not clean.");
  console.error(status);
  process.exit(1);
}

// --- Validate changelog has entry for this version ---
const changelogPath = resolve(import.meta.dirname, "..", "CHANGELOG.md");
const changelog = readFileSync(changelogPath, "utf-8");
const versionHeadingRe = new RegExp(`^## \\[${version.replace(/\./g, "\\.")}\\]`, "m");
if (!versionHeadingRe.test(changelog)) {
  console.error(`Error: CHANGELOG.md has no entry for version ${version}.`);
  console.error(`Add a "## [${version}] - YYYY-MM-DD" section before releasing.`);
  process.exit(1);
}

// --- Run checks ---
console.log("Running checks...");
exec("bun run check");

// --- Update package.json version ---
const pkgPath = resolve(import.meta.dirname, "..", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
pkg.version = version;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Updated package.json version to ${version}`);

// --- Build ---
console.log("Building...");
exec("bun run build");
exec("bun run build:schema");

// --- Build local binary ---
console.log("Building local binary...");
exec("bun run build:binary");

// --- Git commit and tag ---
console.log("Creating git commit and tag...");
exec("git add package.json");
exec(`git commit -m "release: v${version}"`);
exec(`git tag -a "v${version}" -m "v${version}"`);

console.log("");
console.log(`Release v${version} prepared. Next steps:`);
console.log("");
console.log("  git push origin main");
console.log(`  git push origin v${version}`);
console.log("");
