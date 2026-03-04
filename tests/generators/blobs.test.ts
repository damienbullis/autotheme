import { describe, it, expect } from "vitest";
import { mulberry32, generateBlobPath } from "../../src/generators/blobs";

describe("mulberry32", () => {
  it("produces deterministic output for the same seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).toEqual(seq2);
  });

  it("produces different output for different seeds", () => {
    const rng1 = mulberry32(0);
    const rng2 = mulberry32(1);

    expect(rng1()).not.toBe(rng2());
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe("generateBlobPath", () => {
  it("produces a valid SVG path string", () => {
    const rng = mulberry32(0);
    const path = generateBlobPath(6, 0.4, 400, rng);

    expect(path).toContain("M ");
    expect(path).toContain("C ");
    expect(path).toContain("Z");
  });

  it("is deterministic with the same seed", () => {
    const path1 = generateBlobPath(6, 0.4, 400, mulberry32(0));
    const path2 = generateBlobPath(6, 0.4, 400, mulberry32(0));

    expect(path1).toBe(path2);
  });

  it("changes with different seeds", () => {
    const path1 = generateBlobPath(6, 0.4, 400, mulberry32(0));
    const path2 = generateBlobPath(6, 0.4, 400, mulberry32(99));

    expect(path1).not.toBe(path2);
  });

  it("produces more points with higher point count", () => {
    const path6 = generateBlobPath(6, 0.4, 400, mulberry32(0));
    const path12 = generateBlobPath(12, 0.4, 400, mulberry32(0));

    const curves6 = (path6.match(/C /g) || []).length;
    const curves12 = (path12.match(/C /g) || []).length;

    expect(curves12).toBeGreaterThan(curves6);
  });

  it("stays within bounds with zero randomness", () => {
    const rng = mulberry32(0);
    const size = 400;
    const path = generateBlobPath(8, 0, size, rng);

    // Extract all coordinates from the path
    const coords = path.match(/[\d.]+/g)?.map(Number) ?? [];
    for (const c of coords) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(size);
    }
  });
});
