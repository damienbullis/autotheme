package utils

import (
	"github.com/lucasb-eyer/go-colorful"

	"math"
)

// Calculates the contrast ratio between two colors
func ContrastRatio(color1 colorful.Color, color2 colorful.Color) float64 {
	luminance1 := relativeLuminance(color1)
	luminance2 := relativeLuminance(color2)

	if luminance1 > luminance2 {
		return (luminance1 + 0.05) / (luminance2 + 0.05)
	} else {
		return (luminance2 + 0.05) / (luminance1 + 0.05)
	}
}

// Calculates the relative luminance of a given color
func relativeLuminance(color colorful.Color) float64 {
	// Extract RGB values
	r := color.R
	g := color.G
	b := color.B

	// Calculate relative luminance
	r = adjustGamma(r)
	g = adjustGamma(g)
	b = adjustGamma(b)

	return 0.2126*r + 0.7152*g + 0.0722*b
}

func adjustGamma(value float64) float64 {
	if value <= 0.03928 {
		return value / 12.92
	} else {
		return math.Pow((value+0.055)/1.055, 2.4)
	}
}
