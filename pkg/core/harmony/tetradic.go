package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the tetradic (double-complementary) harmony of a given base color (5 colors)
func TetradicHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate complementary hue
	complementaryHue := math.Mod(h+180, 360)

	// Calculate two additional hues
	hue1 := math.Mod(complementaryHue+30, 360)
	hue2 := math.Mod(complementaryHue+150, 360)

	// Create tetradic colors
	tetradicColor1 := colorful.Hsl(h+30, s, l)
	tetradicColor2 := colorful.Hsl(complementaryHue, s, l)
	tetradicColor3 := colorful.Hsl(hue1, s, l)
	tetradicColor4 := colorful.Hsl(hue2, s, l)

	return []colorful.Color{
		baseColor,
		tetradicColor1,
		tetradicColor2,
		tetradicColor3,
		tetradicColor4,
	}
}
