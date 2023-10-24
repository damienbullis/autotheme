package harmony

import (
	"math"

	"github.com/lucasb-eyer/go-colorful"
)

// Calculates the aurelian harmony of a given base color (5 colors)
func CalculateAurelianHarmony(baseColor colorful.Color) []colorful.Color {
	// Define the golden ratio
	goldenRatio := (1 + math.Sqrt(5)) / 2
	h, s, l := baseColor.Hsl()

	// Generate hues based on Fibonacci sequence
	aurelianColors := make([]colorful.Color, 5)
	for i := 0; i < 5; i++ {
		t := float64(i) / float64(5)
		goldenAngle := 360 * (t - math.Floor(t))
		// Not sure if we want to do the +h here?
		hue := math.Mod((goldenAngle/goldenRatio)+h, 360)
		aurelianColors[i] = colorful.Hsl(hue, s, l)
	}

	return aurelianColors
}
