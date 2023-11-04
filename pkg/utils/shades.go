package utils

import (
	"github.com/lucasb-eyer/go-colorful"
)

// Calculates X number of shades of a given color (X colors)
func CalcShades(color colorful.Color, num int) []colorful.Color {
	var shades []colorful.Color

	for i := 1; i < num+1; i++ {
		shades = append(shades, Shade(color, float64(i)/float64(num+1)))
	}

	return shades
}

func Shade(color colorful.Color, factor float64) colorful.Color {
	l, a, b := color.Lab()
	l = l - (l * factor)

	return colorful.Lab(l, a, b).Clamped()
}
