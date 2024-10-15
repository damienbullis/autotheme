package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"

	"github.com/lucasb-eyer/go-colorful"
)

type TextColorNames string

const (
	Main     TextColorNames = "main"
	Dark     TextColorNames = "dark"
	Light    TextColorNames = "light"
	Neutral  TextColorNames = "neutral"
	Contrast TextColorNames = "contrast"
)

type TextColors map[TextColorNames]colorful.Color

type HarmonyColorNames string

const (
	Light5 HarmonyColorNames = "light5"
	Light4 HarmonyColorNames = "light4"
	Light3 HarmonyColorNames = "light3"
	Light2 HarmonyColorNames = "light2"
	Light1 HarmonyColorNames = "light1"
	Root   HarmonyColorNames = "root"
	Dark1  HarmonyColorNames = "dark1"
	Dark2  HarmonyColorNames = "dark2"
	Dark3  HarmonyColorNames = "dark3"
	Dark4  HarmonyColorNames = "dark4"
	Dark5  HarmonyColorNames = "dark5"
	Grey1  HarmonyColorNames = "grey1"
	Grey2  HarmonyColorNames = "grey2"
	Grey3  HarmonyColorNames = "grey3"
	Grey4  HarmonyColorNames = "grey4"
)

type HarmonyColors map[HarmonyColorNames]colorful.Color

type Palette struct {
	Primary        colorful.Color
	OffWhite       colorful.Color
	OffBlack       colorful.Color
	TextPalette    TextPalette
	HarmonyPalette []HarmonyColors
}
type TextPalette struct {
	Light []TextColors
	Dark  []TextColors
}

func BuildTextColors(harmonyColors []HarmonyColors, offW, offB colorful.Color) TextPalette {
	var textColors TextPalette
	var dark, light, grey []colorful.Color
	lightL, darkL := 0.95, 0.05

	for _, palette := range harmonyColors {
		dark = append(
			dark,
			palette[Dark1],
			palette[Dark2],
			palette[Dark3],
			palette[Dark4],
			palette[Dark5],
		)
		light = append(
			light,
			palette[Light1],
			palette[Light2],
			palette[Light3],
			palette[Light4],
			palette[Light5],
		)

		grey = append(
			grey,
			palette[Grey1],
			palette[Grey2],
			palette[Grey3],
			palette[Grey4],
		)

		// Light Mode Calculations
		h, s, _ := palette[Root].Hsl()

		textColors.Light = append(textColors.Light, TextColors{
			Main:     getTextColor([]colorful.Color{palette[Root]}, offB),
			Dark:     getTextColor(dark, offB),
			Light:    getTextColor(light, offB),
			Neutral:  getTextColor(grey, offB),
			Contrast: colorful.Hsl(h, s, darkL),
		})

		// for _, c := range textColors.Light {
		// 	utils.Log.Info("Main: %v\n", c[Main])
		// 	utils.Log.Info("Dark: %v\n", c[Dark])
		// 	utils.Log.Info("Light: %v\n", c[Light])
		// 	utils.Log.Info("Neutral: %v\n", c[Neutral])
		// 	utils.Log.Info("Contrast: %v\n", c[Contrast])
		// }

		// Dark Mode Calculations
		textColors.Dark = append(textColors.Dark, TextColors{
			Main:     getTextColor([]colorful.Color{palette[Root]}, offW),
			Dark:     getTextColor(dark, offW),
			Light:    getTextColor(light, offW),
			Neutral:  getTextColor(grey, offW),
			Contrast: colorful.Hsl(h, s, lightL),
		})

		// Reset the lists
		dark = nil
		light = nil
		grey = nil
	}

	return textColors
}

func blendColors(color1, color2 colorful.Color, steps int) []colorful.Color {
	var colors []colorful.Color
	for i := 0; i < steps; i++ {
		colors = append(colors, color1.BlendLab(color2, float64(i)/float64(steps)))
	}
	return colors
}

func BuildHarmonyColors(palette []colorful.Color) []HarmonyColors {
	var harmonyColors []HarmonyColors
	for _, color := range palette {
		h, s, l := color.Hsl()
		lightGradient := blendColors(color, colorful.Hsl(h, s, 0.92), 6)
		darkGradient := blendColors(color, colorful.Hsl(h, s, 0.08), 6)
		greyGradient := blendColors(color, colorful.Hsl(h, 0.0, l), 5)
		harmonyColors = append(harmonyColors, HarmonyColors{
			Light5: lightGradient[5],
			Light4: lightGradient[4],
			Light3: lightGradient[3],
			Light2: lightGradient[2],
			Light1: lightGradient[1],
			Root:   color,
			Dark1:  darkGradient[1],
			Dark2:  darkGradient[2],
			Dark3:  darkGradient[3],
			Dark4:  darkGradient[4],
			Dark5:  darkGradient[5],
			Grey1:  greyGradient[1],
			Grey2:  greyGradient[2],
			Grey3:  greyGradient[3],
			Grey4:  greyGradient[4],
		})
	}
	return harmonyColors
}

// Builds the palette based on the color and harmony provided
func GeneratePalette(config config.Config) Palette {
	hex, _ := colorful.Hex(config.Primary)

	utils.Log.Info("Calculating your %s color scheme with %s\n",
		utils.Str(config.Harmony, &hex, nil),
		utils.Str(config.Primary, &hex, nil),
	)

	// Get the harmony function
	harmonyFn := harmony.GetHarmonyFn(config.Harmony)
	harmony := harmonyFn(hex)
	// Generate the palette based on the harmony colors
	harmonyPalette := BuildHarmonyColors(harmony)
	offW, offB := getOffWB(harmonyPalette)
	textPalette := BuildTextColors(harmonyPalette, offW, offB)

	return Palette{
		Primary:        hex,
		OffWhite:       offW,
		OffBlack:       offB,
		TextPalette:    textPalette,
		HarmonyPalette: harmonyPalette,
	}
}

/*
Recursively adjust the color until it has a contrast ratio of 7:1 with the off color.

we are calculating the contrast ratio of the colors based on the best
off white and black colors we found

[WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
Text = 7:1 / Large Text = 4.5:1
*/
func makeAccessible(color, offColor colorful.Color) colorful.Color {
	// Exit if the contrast ratio is good
	if cr := utils.ContrastRatio(color, offColor); cr >= 7.0 {
		return color
	} else {
		_, _, ol := offColor.Hsl()
		h, s, l := color.Hsl()

		// if the off color is light, go darker
		if l > ol {
			return makeAccessible(colorful.Hsl(h, s, l+0.1).Clamped(), offColor)
		}

		// if the off color is dark, go lighter
		return makeAccessible(colorful.Hsl(h, s, l-0.1).Clamped(), offColor)
	}
}

// var count = 0

func getTextColor(colors []colorful.Color, offColor colorful.Color) colorful.Color {
	// count += 1
	// utils.Log.Info("getTextColor Called %d times\n", count)
	maxIndex, maxRatio := 0, 0.0
	for i, color := range colors {
		cr := utils.ContrastRatio(color, offColor)
		// utils.Log.Info("Contrast Ratio: %.4f\n", cr)
		if cr > maxRatio {
			// utils.Log.Info("New Best Contrast with index %d\n", i)
			maxIndex = i
			maxRatio = cr
		}
	}

	if maxRatio >= 7.0 {
		// utils.Log.Info("Index of %d with ratio of %.4f\n\n", maxIndex, maxRatio)
		return colors[maxIndex]
	} else {
		// Adjust the color manually
		c := makeAccessible(colors[0], offColor)
		// utils.Log.Info("Manually adjusted %.2f\n\n", utils.ContrastRatio(c, offColor))
		return c
	}
}

// Find the best off white and black based on the color provided
func getOffWB(harmony []HarmonyColors) (colorful.Color, colorful.Color) {
	var bestOffW, bestOffB colorful.Color
	var bestOffWContrast, bestOffBContrast = 0.0, 0.0

	for _, palette := range harmony {
		// Get the off white and black
		h, s, _ := palette[Root].Hsl()
		offW := colorful.Hsl(h, s, 0.97)
		offB := colorful.Hsl(h, s, 0.03)

		// Get the contrast ratio of the off white and black
		offWContrast := utils.ContrastRatio(palette[Root], offW)
		offBContrast := utils.ContrastRatio(palette[Root], offB)

		// If the contrast ratio of the off white is better than the current best
		if offWContrast > bestOffWContrast {
			bestOffW = offW
			bestOffWContrast = offWContrast
		}

		// If the contrast ratio of the off black is better than the current best
		if offBContrast > bestOffBContrast {
			bestOffB = offB
			bestOffBContrast = offBContrast
		}
	}

	return bestOffW, bestOffB
}
