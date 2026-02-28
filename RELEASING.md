# Releasing AutoTheme

Step-by-step guide for publishing a new release.

## Prerequisites

- **npm account** with publish access to the `autotheme` package
- **GitHub push access** to `main` and tags
- **Bun** installed (`bun --version`)

## 1. Update the changelog

Open `CHANGELOG.md` and move entries from the `[Unreleased]` section into a new version heading:

```markdown
## [x.y.z] - YYYY-MM-DD

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Removed

- ...
```

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. The release script will refuse to continue if the version heading is missing.

## 2. Run the release script

```bash
bun run release <version>   # e.g. bun run release 1.0.0
```

The script will:

1. Verify the git working directory is clean
2. Verify `CHANGELOG.md` contains a `## [<version>]` entry
3. Run all checks (`bun run check` — typecheck, lint, format, tests)
4. Update `package.json` to the new version
5. Build the library, schema, and local binary
6. Create a git commit (`release: v<version>`) and annotated tag (`v<version>`)

## 3. Push to GitHub

```bash
git push origin main
git push origin v<version>
```

## 4. What happens next

Pushing the tag triggers CI which will:

- Run the full test suite
- Build standalone binaries for all platforms
- Publish to npm (with provenance)
- Create a draft GitHub release with the binaries attached

## 5. Post-release

1. Go to the [GitHub Releases](../../releases) page
2. Review the draft release created by CI
3. Edit the release notes if needed, then publish
4. Verify the package is live on [npm](https://www.npmjs.com/package/autotheme)

## Changelog format reference

```markdown
## [Unreleased]

## [1.2.0] - 2026-03-15

### Added

- New feature description

### Changed

- Changed behavior description

### Fixed

- Bug fix description

### Removed

- Removed feature description
```
