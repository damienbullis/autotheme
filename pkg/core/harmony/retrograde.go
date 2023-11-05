package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the retrograde harmony of a given base color (5 colors)
func RetrogradeHarmony(baseColor colorful.Color) []colorful.Color {
	analogousColors := make([]colorful.Color, 5)
	length := len(analogousColors)
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()

	// Calculate analogous colors
	for i := 0; i < length; i++ {
		t := float64(i) / float64(length-1)
		angle := t * 115 // Adjust the angle as needed
		analogousHue := math.Mod(h+angle, 360)
		analogousColors[i] = colorful.Hsl(analogousHue, s, l)
	}

	retrogradeColors := make([]colorful.Color, length)

	// Reverse the order of analogous colors
	for i, j := 0, length-1; i < length; i, j = i+1, j-1 {
		retrogradeColors[i] = analogousColors[j]
	}

	return retrogradeColors
}
