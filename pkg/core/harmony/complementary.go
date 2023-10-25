package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the complementary harmony of a given base color (2 colors)
func ComplementaryHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate complementary hue
	complementaryHue := math.Mod(h+180, 360)

	// Create complementary color
	complementaryColor := colorful.Hsl(complementaryHue, s, l)

	return []colorful.Color{baseColor, complementaryColor}
}
