package utils

import (
	"github.com/lucasb-eyer/go-colorful"
)

// Calculates X number of tones of a given color (X colors)
func CalcTones(color colorful.Color, num int) []colorful.Color {
	var tones []colorful.Color
	tones = append(tones, color)

	for i := 1; i < num; i++ {
		tones = append(tones, Tone(color, float64(i)/float64(num)))
	}

	return tones
}

func Tone(color colorful.Color, factor float64) colorful.Color {
	l, a, b := color.Lab()

	// Adjust both "A" and "B" channels to maintain the color's hue
	a = a * factor
	b = b * factor

	return colorful.Lab(l, a, b).Clamped()
}
