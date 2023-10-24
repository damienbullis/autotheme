package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the split complementary harmony of a given base color (3 colors)
func CalculateSplitComplementaryHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate complementary hue
	complementaryHue := math.Mod(h+180, 360)

	// Calculate split complementary hues
	splitComplementaryHue1 := math.Mod(complementaryHue+30, 360)
	splitComplementaryHue2 := math.Mod(complementaryHue+330, 360)

	// Create split complementary colors
	splitComplementaryColor1 := colorful.Hsl(splitComplementaryHue1, s, l)
	splitComplementaryColor2 := colorful.Hsl(splitComplementaryHue2, s, l)

	return []colorful.Color{baseColor, splitComplementaryColor1, splitComplementaryColor2}
}
