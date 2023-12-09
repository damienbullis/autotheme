package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"

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
	Gray1  HarmonyColorNames = "gray1"
	Gray2  HarmonyColorNames = "gray2"
	Gray3  HarmonyColorNames = "gray3"
	Gray4  HarmonyColorNames = "gray4"
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
	var dark, light, gray []colorful.Color
	lightL, darkL := 0.95, 0.05

	for _, palette := range harmonyColors {
		dark = append(dark, palette[Dark1])
		dark = append(dark, palette[Dark2])
		dark = append(dark, palette[Dark3])
		dark = append(dark, palette[Dark4])
		dark = append(dark, palette[Dark5])
		light = append(light, palette[Light1])
		light = append(light, palette[Light2])
		light = append(light, palette[Light3])
		light = append(light, palette[Light4])
		light = append(light, palette[Light5])
		gray = append(gray, palette[Gray1])
		gray = append(gray, palette[Gray2])
		gray = append(gray, palette[Gray3])
		gray = append(gray, palette[Gray4])

		// Light Mode Calculations
		h, s, _ := palette[Root].Hsl()

		textColors.Light = append(textColors.Light, TextColors{
			Main:     getTextColor([]colorful.Color{palette[Root]}, offB),
			Dark:     getTextColor(dark, offB),
			Light:    getTextColor(light, offB),
			Neutral:  getTextColor(gray, offB),
			Contrast: colorful.Hsl(h, s, darkL),
		})

		// Dark Mode Calculations
		textColors.Dark = append(textColors.Dark, TextColors{
			Main:     getTextColor([]colorful.Color{palette[Root]}, offW),
			Dark:     getTextColor(dark, offW),
			Light:    getTextColor(light, offW),
			Neutral:  getTextColor(gray, offW),
			Contrast: colorful.Hsl(h, s, lightL),
		})

		// Reset the lists
		dark = nil
		light = nil
		gray = nil
	}

	return textColors
}

func BuildHarmonyColors(palette []colorful.Color) []HarmonyColors {
	var harmonyColors []HarmonyColors
	for _, color := range palette {
		h, s, l := color.Hsl()
		harmonyColors = append(harmonyColors, HarmonyColors{
			Light5: colorful.Hsl(h, s, l+0.4).Clamped(),
			Light4: colorful.Hsl(h, s, l+(.4*(4.0/5.0))).Clamped(),
			Light3: colorful.Hsl(h, s, l+(.4*(3.0/5.0))).Clamped(),
			Light2: colorful.Hsl(h, s, l+(.4*(2.0/5.0))).Clamped(),
			Light1: colorful.Hsl(h, s, l+(.4*(1.0/5.0))).Clamped(),
			Root:   color,
			Dark1:  colorful.Hsl(h, s, l-0.4*(1.0/5.0)).Clamped(),
			Dark2:  colorful.Hsl(h, s, l-0.4*(2.0/5.0)).Clamped(),
			Dark3:  colorful.Hsl(h, s, l-0.4*(3.0/5.0)).Clamped(),
			Dark4:  colorful.Hsl(h, s, l-0.4*(4.0/5.0)).Clamped(),
			Dark5:  colorful.Hsl(h, s, l-0.4).Clamped(),
			Gray1:  colorful.Hsl(h, s-0.2, l).Clamped(),
			Gray2:  colorful.Hsl(h, s-0.4, l).Clamped(),
			Gray3:  colorful.Hsl(h, s-0.6, l).Clamped(),
			Gray4:  colorful.Hsl(h, s-0.8, l).Clamped(),
		})
	}
	return harmonyColors
}

// Calc the contrast ratio of the colors based on the best off white and black colors
// [WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
// Text = 7:1 / Large Text = 4.5:1

// Builds the palette based on the color and harmony provided
func GeneratePalette(config config.Config) Palette {
	hex, _ := colorful.Hex(config.Primary)

	utils.Log.Info("\nCalculating your %s color scheme with %s\n",
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
Recursively adjust the color until it has a contrast ratio of 7:1 with the off color

[WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
Text = 7:1 / Large Text = 4.5:1
*/
func makeAccessible(color, offColor colorful.Color) colorful.Color {
	// Exit if the contrast ratio is good
	if cr := utils.ContrastRatio(color, offColor); cr >= 7 {
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

func getTextColor(colors []colorful.Color, offColor colorful.Color) colorful.Color {
	maxIndex, maxRatio := 0, 0.0
	for i, color := range colors {
		cr := utils.ContrastRatio(color, offColor)
		if cr > maxRatio {
			maxIndex = i
			maxRatio = cr
		}
	}

	if maxRatio >= 7 {
		fmt.Printf("Contrast Ratio: %.2f\n", maxRatio)
		return colors[maxIndex]
	} else {
		// Adjust the color manually
		c := makeAccessible(colors[0], offColor)
		fmt.Printf("Adjusted Contrast Ratio: %.2f\n", utils.ContrastRatio(c, offColor))
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
