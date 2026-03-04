import type { BlobConfig } from "../config/types";

/**
 * Mulberry32 seeded PRNG — deterministic 32-bit random number generator.
 * Returns a function that produces numbers in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generate a blob SVG path by placing N control points on a circle
 * with random radial offsets, then connecting with smooth cubic beziers.
 */
export function generateBlobPath(
  points: number,
  randomness: number,
  size: number,
  rng: () => number,
): string {
  const center = size / 2;
  const baseRadius = size * 0.35; // 70% diameter = 35% radius
  const angleStep = (2 * Math.PI) / points;

  // Generate radial control points
  const controlPoints: Point[] = [];
  for (let i = 0; i < points; i++) {
    const angle = angleStep * i - Math.PI / 2; // Start from top
    const offset = 1 + (rng() * 2 - 1) * randomness;
    const r = baseRadius * offset;
    controlPoints.push({
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    });
  }

  // Build smooth cubic bezier path using Catmull-Rom → Bezier conversion
  return catmullRomToBezierPath(controlPoints);
}

/**
 * Convert a closed set of points to a smooth cubic bezier SVG path
 * using Catmull-Rom spline conversion.
 */
function catmullRomToBezierPath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return "";

  const parts: string[] = [];
  parts.push(`M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`);

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;

    // Catmull-Rom to cubic bezier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    parts.push(
      `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    );
  }

  parts.push("Z");
  return parts.join(" ");
}

/**
 * Encode an SVG blob to a data URL
 */
function blobSvgToDataUrl(path: string, size: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><path d='${path}' fill='black'/></svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Generate blob CSS variables
 */
export function generateBlobsCSS(config: BlobConfig, comments: boolean): string {
  const lines: string[] = [];
  const rng = mulberry32(config.seed);

  if (comments) lines.push("    /* Blobs */");

  for (let i = 0; i < config.count; i++) {
    const path = generateBlobPath(config.points, config.randomness, config.size, rng);
    const dataUrl = blobSvgToDataUrl(path, config.size);

    lines.push(`    --blob-${i + 1}: ${dataUrl};`);
    lines.push(`    --blob-clip-${i + 1}: path("${path}");`);
  }

  return lines.join("\n");
}
