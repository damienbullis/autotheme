package core

import (
	"autotheme/pkg/config"
)

func GenerateGradients(config *config.Config, palette *Palette) []string {
	main := &palette.Harmony.Harmony0.Main
	harmony := []*HarmonyColorType{
		&palette.Harmony.Harmony1,
		palette.Harmony.Harmony2,
		palette.Harmony.Harmony3,
		palette.Harmony.Harmony4,
		palette.Harmony.Harmony5,
	}

	var gradients []string
	for _, color := range harmony {
		if color == nil {
			continue
		}

		// Generate gradients
		gradient := "in Oklab, " + main.Hex() + ", " + color.Main.Hex()
		gradients = append(gradients, gradient)
	}
	rainbow := "in Oklab, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8B00FF"
	gradients = append(gradients, rainbow)

	return gradients
}
