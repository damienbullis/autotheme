package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

func CalculateRectangleHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate complementary hue
	complementaryHue := math.Mod(h+180, 360)

	// Calculate two additional hues
	hue1 := math.Mod(complementaryHue+60, 360)
	hue2 := math.Mod(complementaryHue+240, 360)

	// Create rectangle colors
	rectColor1 := colorful.Hsl(h, s, l)
	rectColor2 := colorful.Hsl(complementaryHue, s, l)
	rectColor3 := colorful.Hsl(hue1, s, l)
	rectColor4 := colorful.Hsl(hue2, s, l)

	return []colorful.Color{baseColor, rectColor1, rectColor2, rectColor3, rectColor4}
}
