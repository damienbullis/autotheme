package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the bi-polar harmony of a given base color. This harmony was created by GPT.
func CalculateBiPolarHarmony(baseColor colorful.Color) []colorful.Color {
	// Convert base color to HSL color space
	h, s, l := baseColor.Hsl()
	const steps = 5

	// Calculate complementary color
	newHue := math.Mod(h+180, 360)
	complementaryColor := colorful.Hsl(newHue, s, l)

	// Create a gradient of colors between the base color and its complement
	gradientColors := make([]colorful.Color, steps)
	for i := 0; i < steps; i++ {
		t := float64(i) / float64(steps-1)
		gradientColors[i] = baseColor.BlendHcl(complementaryColor, t)
	}

	return gradientColors
}
