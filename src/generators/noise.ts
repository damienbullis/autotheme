/**
 * Generate inline SVG noise texture for backgrounds
 * @param frequency - Turbulence frequency (default: 0.7)
 * @returns CSS url() string with encoded SVG data
 */
export function generateNoiseSVG(frequency: number = 0.7): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3' stitchTiles='stitch' /></filter><rect width='100%' height='100%' filter='url(%23noise)' /></svg>`;

  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");

  return `url("data:image/svg+xml,${encoded}")`;
}
