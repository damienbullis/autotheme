package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"

	"github.com/lucasb-eyer/go-colorful"
)

type ColorType struct {
	Color  colorful.Color
	Shades []colorful.Color
	Tones  []colorful.Color
	Tints  []colorful.Color
	OffW   colorful.Color
	OffB   colorful.Color
}

type TextColorType struct {
	Main     colorful.Color
	Dark     colorful.Color
	Light    colorful.Color
	Neutral  colorful.Color
	Contrast colorful.Color
}

type HarmonyColorType struct {
	Light5 colorful.Color
	Light4 colorful.Color
	Light3 colorful.Color
	Light2 colorful.Color
	Light1 colorful.Color
	Main   colorful.Color
	Dark1  colorful.Color
	Dark2  colorful.Color
	Dark3  colorful.Color
	Dark4  colorful.Color
	Dark5  colorful.Color
	Gray1  colorful.Color
	Gray2  colorful.Color
	Gray3  colorful.Color
	Gray4  colorful.Color
}

type ModeType struct {
	Background colorful.Color
	Harmony0   TextColorType
	Harmony1   TextColorType
	Harmony2   *TextColorType
	Harmony3   *TextColorType
	Harmony4   *TextColorType
	Harmony5   *TextColorType
}

type HarmonyType struct {
	Harmony0 HarmonyColorType
	Harmony1 HarmonyColorType
	Harmony2 *HarmonyColorType
	Harmony3 *HarmonyColorType
	Harmony4 *HarmonyColorType
	Harmony5 *HarmonyColorType
}

func (h HarmonyType) GetColors() []HarmonyColorType {
	nonNilColors := []HarmonyColorType{
		h.Harmony0,
		h.Harmony1,
	}
	if h.Harmony2 != nil {
		nonNilColors = append(nonNilColors, *h.Harmony2)
	}
	if h.Harmony3 != nil {
		nonNilColors = append(nonNilColors, *h.Harmony3)
	}
	if h.Harmony4 != nil {
		nonNilColors = append(nonNilColors, *h.Harmony4)
	}
	if h.Harmony5 != nil {
		nonNilColors = append(nonNilColors, *h.Harmony5)
	}

	return nonNilColors
}

type Palette struct {
	Light   ModeType
	Dark    ModeType
	Harmony HarmonyType
}

// Calc the contrast ratio of the colors based on the best off white and black colors
// [WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
// Text = 7:1 / Large Text = 4.5:1

// Builds the palette based on the color and harmony provided
func GeneratePalette(config config.Config) Palette {
	hex, _ := colorful.Hex(config.Primary)

	// Get the harmony function
	harmonyFn := harmony.GetHarmonyFn(config.Harmony)

	// Generate the palette based on the harmony colors
	var palette []ColorType
	for _, color := range harmonyFn(hex) {
		h, s, _ := color.Hsl()
		palette = append(palette, ColorType{
			Color:  color,
			Shades: utils.CalcShades(color, 5),
			Tones:  utils.CalcTones(color, 5),
			Tints:  utils.CalcTints(color, 5),
			OffW:   colorful.Hsl(h, s, 0.9667),
			OffB:   colorful.Hsl(h, s, 0.0333),
		})
	}

	bestOffW, bestOffB := getOffWB(palette, hex)

	results := Palette{
		Light:   buildModeStruct(palette, bestOffW, "light"),
		Dark:    buildModeStruct(palette, bestOffB, "dark"),
		Harmony: buildHarmonyStruct(palette),
	}

	return results
}

func buildModeStruct(palette []ColorType, offColor colorful.Color, mode string) ModeType {
	result := ModeType{
		Background: offColor,
	}
	for i, color := range palette {
		switch i {
		case 0:
			result.Harmony0 = buildTextColorStruct(color, offColor, mode)
		case 1:
			result.Harmony1 = buildTextColorStruct(color, offColor, mode)
		case 2:
			temp := buildTextColorStruct(color, offColor, mode)
			result.Harmony2 = &temp
		case 3:
			temp := buildTextColorStruct(color, offColor, mode)
			result.Harmony3 = &temp
		case 4:
			temp := buildTextColorStruct(color, offColor, mode)
			result.Harmony4 = &temp
		case 5:
			temp := buildTextColorStruct(color, offColor, mode)
			result.Harmony5 = &temp
		}

	}

	return result
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
			return makeAccessible(colorful.Hsl(h, s, l+0.1), offColor)
		}

		// if the off color is dark, go lighter
		return makeAccessible(colorful.Hsl(h, s, l-0.1), offColor)
	}
}

func buildTextColorStruct(color ColorType, offColor colorful.Color, mode string) TextColorType {
	var contrast colorful.Color
	if mode == "light" {
		contrast = color.OffB
	} else if mode == "dark" {
		contrast = color.OffW
	}
	return TextColorType{
		Main:     makeAccessible(color.Color, offColor),
		Dark:     getTextColor(color.Shades, offColor),
		Light:    getTextColor(color.Tints, offColor),
		Neutral:  getTextColor(color.Tones, offColor),
		Contrast: contrast,
	}
}

func getTextColor(colors []colorful.Color, offColor colorful.Color) colorful.Color {
	for _, color := range colors {
		// Return the first color that has a contrast ratio of 7:1

		if cr := utils.ContrastRatio(color, offColor); cr >= 7 {
			return color
		}
	}

	// Make sure we have a color
	return makeAccessible(colors[0], offColor)
}

func buildHarmonyStruct(palette []ColorType) HarmonyType {
	var harmony HarmonyType
	for i, color := range palette {
		switch i {
		case 0:
			harmony.Harmony0 = buildHarmonyColorStruct(color)
		case 1:
			harmony.Harmony1 = buildHarmonyColorStruct(color)
		case 2:
			temp := buildHarmonyColorStruct(color)
			harmony.Harmony2 = &temp
		case 3:
			temp := buildHarmonyColorStruct(color)
			harmony.Harmony3 = &temp
		case 4:
			temp := buildHarmonyColorStruct(color)
			harmony.Harmony4 = &temp
		case 5:
			temp := buildHarmonyColorStruct(color)
			harmony.Harmony5 = &temp
		}
	}

	return harmony
}

/*
Build the harmony color struct

  - Main: the main color
  - Dark1-5: the 5 shades of the main color
  - Gray1-4: the 4 tones of the main color
  - Light1-5: the 5 tints of the main color
*/
func buildHarmonyColorStruct(color ColorType) HarmonyColorType {
	results := HarmonyColorType{
		Main: color.Color,
	}

	for i, shade := range color.Shades {
		switch i {
		case 0:
			results.Dark1 = shade
		case 1:
			results.Dark2 = shade
		case 2:
			results.Dark3 = shade
		case 3:
			results.Dark4 = shade
		case 4:
			results.Dark5 = shade
		}
	}

	for i, tone := range color.Tones {
		switch i {
		case 0:
			results.Gray1 = tone
		case 1:
			results.Gray2 = tone
		case 2:
			results.Gray3 = tone
		case 3:
			results.Gray4 = tone
		}
	}

	for i, tint := range color.Tints {
		switch i {
		case 0:
			results.Light1 = tint
		case 1:
			results.Light2 = tint
		case 2:
			results.Light3 = tint
		case 3:
			results.Light4 = tint
		case 4:
			results.Light5 = tint
		}
	}

	return results
}

// Find the best off white and black based on the color provided
func getOffWB(palette []ColorType, hex colorful.Color) (colorful.Color, colorful.Color) {
	var bestOffW, bestOffB colorful.Color
	var bestOffWContrast, bestOffBContrast float64
	for i, color := range palette {
		if i == 0 {
			continue
		}
		offWContrast := utils.ContrastRatio(hex, color.OffW)
		offBContrast := utils.ContrastRatio(hex, color.OffB)
		if offWContrast > bestOffWContrast {
			bestOffW = color.OffW
			bestOffWContrast = offWContrast
		}
		if offBContrast > bestOffBContrast {
			bestOffB = color.OffB
			bestOffBContrast = offBContrast
		}
	}
	return bestOffW, bestOffB
}
