# Testing Philosophy

## Guiding Principles

### Test behavior, not structure

Bad: `expect(result.content).toContain("--color-primary-500:")`
Good: `expect(parseCSSVariable(result, "--color-primary-500")).toMatchOKLCH(primaryColor)`

String-contains checks are fragile (break on formatting changes) and shallow (don't verify correctness). Test what the code _does_, not what it _looks like_.

### Three tiers of tests

**Tier 1: Integration tests (highest value)**
Test the full pipeline end-to-end. These catch real bugs and give confidence during refactors.

- Config → theme → CSS output → verify output is correct and complete
- CLI with `--stdout` → verify complete output for known inputs
- Round-trip consistency: generated colors should survive conversion chains
- Cross-module contracts: foreground colors actually contrast with backgrounds at WCAG level

**Tier 2: Algorithm unit tests (high value)**
Lock in critical math and logic that's hard to verify by eye.

- Color space conversions (round-trip accuracy, known reference values)
- WCAG luminance and contrast ratio calculations
- Harmony generation (hue wrapping, swing strategies, custom harmonies)
- Palette variations (tint/shade/tone monotonicity, boundary clamping)
- Config merge precedence (defaults < preset < file < CLI)
- Config validation (reject invalid input with clear errors)

**Tier 3: Don't test (skip or delete)**

- Export existence checks — TypeScript catches these at compile time
- Default value checks — restating the source code as a test adds no value
- String template output — if you're just checking a hardcoded string appears in another hardcoded string, it's a tautology
- Library wrappers — don't test that `cac` parses `--flag value` correctly
- Logging format — ANSI color codes in console output aren't worth testing

### When to add a test

- **New algorithm or formula**: Always. Include reference values from external sources when possible (e.g., WCAG spec for luminance).
- **Bug fix**: Always add a regression test that reproduces the bug before fixing.
- **New feature toggle**: One integration test proving it works when on, one proving it's absent when off.
- **Refactoring**: Don't add new tests. Existing integration tests should catch regressions. If they don't, that's a sign the integration tests need improvement.

### When NOT to add a test

- You're checking that a property exists or has a default value
- You're testing a third-party library's behavior
- TypeScript's type system already enforces the constraint
- The test would break if you reformatted the output (whitespace, ordering)
- The test is `expect(x).toContain(y)` where both x and y are static strings you wrote

### Test helpers

Use shared test helpers (`tests/helpers/`) to avoid duplicating theme/config construction across test files. Helpers should create minimal valid objects — don't set every option, only what the test needs.

### Snapshot tests

Use snapshots sparingly for full CSS output regression detection — one snapshot per major config profile (default, all-features-on, shadcn-only). Snapshots are a safety net, not a specification. When a snapshot changes, verify the diff is intentional, then update.

### What "correct" means for color output

A color test should verify:

1. The value is a syntactically valid OKLCH/HSL/hex string
2. The color's hue/saturation/lightness are within expected ranges
3. Contrast relationships hold (foreground vs background meets WCAG target)

Not: "the exact string `oklch(0.65 0.15 250)` appears in the output."
