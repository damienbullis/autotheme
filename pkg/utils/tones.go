package utils

import (
	"github.com/lucasb-eyer/go-colorful"
)

// Calculates X number of tones of a given color (X colors)
func CalcTones(color colorful.Color, num int) []colorful.Color {
	var tones []colorful.Color

	for i := 1; i < num+1; i++ {
		tones = append(tones, Tone(color, float64(i)/float64(num+1)))
	}

	return tones
}

func Tone(color colorful.Color, factor float64) colorful.Color {
	l, a, b := color.Lab()

	// Adjust both "A" and "B" channels to maintain the color's hue
	a = a * (1 - factor)
	b = b * (1 - factor)

	return colorful.Lab(l, a, b).Clamped()
}
