# Harmony Comparison: Go vs TypeScript

This document compares the color harmony implementations between the original Go AutoTheme and the TypeScript rewrite.

## Summary

| Harmony             | Go Colors | TS Colors | Go Offsets          | TS Offsets            | Match     |
| ------------------- | --------- | --------- | ------------------- | --------------------- | --------- |
| Complementary       | 2         | 2         | 0°, 180°            | 0°, 180°              | Exact     |
| Analogous           | 3         | 3         | -30°, 0°, 30°       | -30°, 0°, 30°         | Exact     |
| Triadic             | 3         | 3         | 0°, 120°, 240°      | 0°, 120°, 240°        | Exact     |
| Split-Complementary | 3         | 3         | 0°, 150°, 210°      | 0°, 150°, 210°        | Exact     |
| Tetradic            | 4         | 4         | 0°, 90°, 180°, 270° | 0°, ~47°, ~94°, ~141° | Different |
| Square              | 4         | 4         | 0°, 90°, 180°, 270° | 0°, 90°, 180°, 270°   | Exact     |
| Rectangle           | 4         | 4         | 0°, 60°, 180°, 240° | 0°, 60°, 180°, 240°   | Exact     |
| Aurelian            | 3         | 3         | 0°, 137.5°, 275°    | 0°, 137.5°, 275°      | Exact     |
| Bi-Polar            | 4         | 2         | 0°, 90°, 180°, 270° | 0°, 90°               | Different |
| Retrograde          | 3         | 3         | 0°, 240°, 120°      | 0°, 240°, 120°        | Exact     |
| Lunar Eclipse       | 3         | —         | 0°, 60°, 300°       | Not implemented       | Missing   |

## Detailed Differences

### Tetradic (Go vs TS)

The Go `tetradic` harmony uses equal 90° spacing (identical to `square`). The TS `tetradic` harmony uses a pi-based formula `((i * π) / 6) * 90` producing non-uniform spacing:

- **Go tetradic**: `[0°, 90°, 180°, 270°]` — 4 equally spaced colors
- **TS tetradic**: `[0°, ~47.1°, ~94.2°, ~141.4°]` — pi-scaled offsets

The TS version is an intentional divergence to create a more dynamic, less symmetric palette. The commented-out alternative `((i < 2) ? i : -1*i) * 87.5` suggests experimentation with this harmony.

### Bi-Polar

- **Go**: 4 colors at `[0°, 90°, 180°, 270°]` — functionally identical to square/tetradic
- **TS**: 2 colors at `[0°, 90°]` — emphasizes the "two dominant poles" concept

The TS version reduces color count to better match the semantic meaning of "bi-polar" (two poles), making it distinct from the square harmony.

### Lunar Eclipse (Go only)

The Go implementation includes an 11th harmony type called `lunar-eclipse` which generates 3 colors at `[0°, 60°, 300°]`. This harmony was not ported to the TS rewrite.

## Implementation Notes

Both implementations use the same core approach:

1. Start with a primary color's HSL values
2. Apply hue rotation offsets to generate harmony colors
3. Preserve saturation and lightness from the primary color

The TS version uses a unified `HarmonyDefinition` interface with `count` and `offset` function, making it easy to add custom harmonies via `generateCustomHarmony()`.

## Color Counts by Harmony

| Count | Harmonies                                                     |
| ----- | ------------------------------------------------------------- |
| 2     | Complementary, Bi-Polar                                       |
| 3     | Analogous, Triadic, Split-Complementary, Aurelian, Retrograde |
| 4     | Tetradic, Square, Rectangle                                   |
