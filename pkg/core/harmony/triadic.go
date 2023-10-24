package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the triadic harmony of a given base color (3 colors)
func CalculateTriadicHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate triadic hues (120 degrees apart)
	triadicHue1 := math.Mod(h+120, 360)
	triadicHue2 := math.Mod(h+240, 360)

	// Create triadic colors
	triadicColor1 := colorful.Hsl(triadicHue1, s, l)
	triadicColor2 := colorful.Hsl(triadicHue2, s, l)

	return []colorful.Color{baseColor, triadicColor1, triadicColor2}
}
