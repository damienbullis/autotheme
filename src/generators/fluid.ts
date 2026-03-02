/**
 * Generate a CSS clamp() value for fluid scaling between viewport sizes.
 *
 * @param min - Minimum value in rem
 * @param max - Maximum value in rem
 * @param vpMin - Minimum viewport width in px
 * @param vpMax - Maximum viewport width in px
 * @returns CSS clamp() string like `clamp(0.512rem, 0.456rem + 0.28vw, 0.8rem)`
 */
export function fluidValue(min: number, max: number, vpMin: number, vpMax: number): string {
  // slope in vw units: (max - min) / (vpMax - vpMin) * 100
  const slopeVw = ((max - min) / (vpMax - vpMin)) * 100;

  // y-intercept in rem: min - slope * vpMin (converting vpMin px to vw fraction)
  const intercept = min - (slopeVw * vpMin) / 100;

  const minStr = `${min.toFixed(3)}rem`;
  const maxStr = `${max.toFixed(3)}rem`;
  const preferred = `${intercept.toFixed(3)}rem + ${slopeVw.toFixed(3)}vw`;

  return `clamp(${minStr}, ${preferred}, ${maxStr})`;
}

/**
 * Generate a fluid scale from a static scale.
 * Each value gets a min (value * 0.75) and max (value) for the clamp range.
 */
export function fluidScale(values: number[], vpMin: number, vpMax: number): string[] {
  return values.map((value) => {
    const min = value * 0.75;
    return fluidValue(min, value, vpMin, vpMax);
  });
}
