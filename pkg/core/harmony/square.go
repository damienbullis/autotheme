package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the square harmony of a given base color (4 colors)
func CalculateSquareHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate square hues (90 degrees apart)
	squareHue1 := math.Mod(h+90, 360)
	squareHue2 := math.Mod(h+180, 360)
	squareHue3 := math.Mod(h+270, 360)

	// Create square colors
	squareColor1 := colorful.Hsl(squareHue1, s, l)
	squareColor2 := colorful.Hsl(squareHue2, s, l)
	squareColor3 := colorful.Hsl(squareHue3, s, l)

	return []colorful.Color{baseColor, squareColor1, squareColor2, squareColor3}
}
