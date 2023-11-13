package core

import (
	"autotheme/pkg/config"

	"github.com/lucasb-eyer/go-colorful"
)

func GenerateGradients(config *config.Config, palette *Palette) [][]*colorful.Color {
	if !config.Gradients {
		return [][]*colorful.Color{}
	}

	main := &palette.Harmony.Harmony0.Main
	harmony := []*HarmonyColorType{
		&palette.Harmony.Harmony1,
		palette.Harmony.Harmony2,
		palette.Harmony.Harmony3,
		palette.Harmony.Harmony4,
		palette.Harmony.Harmony5,
	}

	var gradients [][]*colorful.Color
	for _, c := range harmony {
		if c == nil {
			continue
		}

		// Generate gradients
		gradient := []*colorful.Color{
			main,
			&c.Main,
		}
		gradients = append(gradients, gradient)
	}

	// Add rainbow gradient
	rainbow := []*colorful.Color{
		{R: 1, G: 0, B: 0},
		{R: 1, G: 0.5, B: 0},
		{R: 1, G: 1, B: 0},
		{R: 0, G: 1, B: 0},
		{R: 0, G: 0, B: 1},
		{R: 0.29, G: 0, B: 0.51},
		{R: 0.55, G: 0, B: 1},
	}
	gradients = append(gradients, rainbow)

	return gradients
}
