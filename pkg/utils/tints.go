package utils

import (
	"github.com/lucasb-eyer/go-colorful"
)

// Calculates X number of tints of a given color (X colors)
func CalcTints(color colorful.Color, num int) []colorful.Color {
	var tints []colorful.Color
	tints = append(tints, color)

	for i := 1; i < num; i++ {
		tints = append(tints, Tint(color, float64(i)/float64(num-1)))
	}

	return tints
}

func Tint(color colorful.Color, factor float64) colorful.Color {
	l, a, b := color.Lab()
	l = l + ((1 - l) * factor)
	return colorful.Lab(l, a, b).Clamped()
}