package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the analogous harmony of a given base color (3 colors)
func CalculateAnalogousHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate analogous hues (30 degrees apart)
	analogousHue1 := math.Mod(h+30, 360)
	analogousHue2 := math.Mod(h+60, 360)

	// Create analogous colors
	analogousColor1 := colorful.Hsl(analogousHue1, s, l)
	analogousColor2 := colorful.Hsl(analogousHue2, s, l)

	return []colorful.Color{baseColor, analogousColor1, analogousColor2}
}
