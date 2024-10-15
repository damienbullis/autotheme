package harmony

import "github.com/lucasb-eyer/go-colorful"

// Calculates the lunar eclipse harmony of a given base color (6 colors)
func LunarEclipseHarmony(baseColor colorful.Color) []colorful.Color {
	// Generate deep, earthy tones
	numColors := 3
	deepTones := make([]colorful.Color, numColors)
	for i := 0; i < numColors; i++ {
		t := float64(i) / float64(numColors-1)
		l, u, v := baseColor.Luv()
		deepTones[i] = baseColor.BlendLuv(colorful.Luv(l+.3, u, v).Clamped(), t)
	}

	// Generate subtle, muted greys
	mutedGreys := make([]colorful.Color, numColors)
	h, _, _ := baseColor.Hsl()
	desaturatedGrey := colorful.Hsl(h, 0, .5)
	for i := 0; i < numColors; i++ {
		t := float64(i) / float64(numColors-1)
		mutedGreys[i] = baseColor.BlendLab(desaturatedGrey, t)
	}

	// Combine deep tones and muted greys
	deepTones = append(deepTones, mutedGreys...)

	return deepTones
}
