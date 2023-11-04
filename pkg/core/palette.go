package core

import (
	"autotheme/pkg/config"
	h "autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"
	"strconv"
	"strings"
	"unicode/utf8"

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
	Light    colorful.Color
	Dark     colorful.Color
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

type Palette struct {
	Light   ModeType
	Dark    ModeType
	Harmony HarmonyType
}

// Calc the contrast ratio of the colors based on the best off white and black colors
// [WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
// Text = 7:1 / Large Text = 4.5:1

func GeneratePalette(config *config.Config) Palette {
	// Generate the theme
	base, harmony := config.Primary, config.Harmony

	// Build harmony
	// check if color was supplied
	if base == "" {
		fmt.Println("No color supplied, picking, random color...")
		base = utils.GetRandomColor()
	}
	hex, _ := colorful.Hex(base)

	// check if harmony was supplied
	if harmony == "" {
		fmt.Println("No harmony supplied, picking random harmony...")
		harmony = h.GetRandomHarmony()
	}
	fmt.Println("\nHarmony: ", harmony, " Color: ", hex.Hex())
	// Get the harmony function
	harmonyFn := h.GetHarmonyFn(harmony)

	// Generate the palette based on the harmony
	// starting with the primary color,
	// followed by the harmony colors
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

	// We will use these to calculate the rest of the contrast ratios
	bestOffW, bestOffB := getOffWB(palette, hex)

	// NEXT: make sure to remove this later or handle better
	printColorStats(palette, bestOffW, bestOffB)

	results := Palette{
		Light:   buildModeStruct(palette, bestOffW),
		Dark:    buildModeStruct(palette, bestOffB),
		Harmony: buildHarmonyStruct(palette),
	}

	return results
}

func buildModeStruct(palette []ColorType, offColor colorful.Color) ModeType {
	var mode ModeType
	var temp TextColorType
	for i, color := range palette {
		switch i {
		case 0:
			mode.Background = color.Color
			mode.Harmony0 = buildTextColorStruct(color, offColor)
		case 1:
			mode.Harmony1 = buildTextColorStruct(color, offColor)
		case 2:
			temp = buildTextColorStruct(color, offColor)
			mode.Harmony2 = &temp
		case 3:
			temp = buildTextColorStruct(color, offColor)
			mode.Harmony3 = &temp
		case 4:
			temp = buildTextColorStruct(color, offColor)
			mode.Harmony4 = &temp
		case 5:
			temp = buildTextColorStruct(color, offColor)
			mode.Harmony5 = &temp
		}
	}

	return mode
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

func buildTextColorStruct(color ColorType, offColor colorful.Color) TextColorType {
	results := TextColorType{
		Main:     makeAccessible(color.Color, offColor),
		Contrast: offColor,
	}

	for _, shade := range color.Shades {
		// check the contrast break on the first shade with 7:1
		if utils.ContrastRatio(shade, offColor) >= 7 {
			results.Dark = shade
			break
		}
	}
	// Make sure ww have a color
	if results.Dark.Hex() == "" {
		results.Dark = makeAccessible(color.Shades[0], offColor)
	}

	return results
}

func buildHarmonyStruct(palette []ColorType) HarmonyType {
	var harmony HarmonyType
	var temp HarmonyColorType
	for i, color := range palette {
		switch i {
		case 0:
			harmony.Harmony0 = buildHarmonyColorStruct(color)
		case 1:
			harmony.Harmony1 = buildHarmonyColorStruct(color)
		case 2:
			temp = buildHarmonyColorStruct(color)
			harmony.Harmony2 = &temp
		case 3:
			temp = buildHarmonyColorStruct(color)
			harmony.Harmony3 = &temp
		case 4:
			temp = buildHarmonyColorStruct(color)
			harmony.Harmony4 = &temp
		case 5:
			temp = buildHarmonyColorStruct(color)
			harmony.Harmony5 = &temp
		}
	}

	return harmony
}

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

func getOffWB(palette []ColorType, hex colorful.Color) (colorful.Color, colorful.Color) {
	// Find the best off white and black colors based on the primary color
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

func printColorStats(palette []ColorType, bestOffW, bestOffB colorful.Color) {
	seperator := strings.Join(make([]string, 100), "-") + "\n"
	for _, color := range palette {
		fmt.Println(seperator)

		fmt.Println(minLineLength("Color") + utils.Str(" "+color.Color.Hex()+" ", nil, &color.Color) + minLineLength(prettyContrast(color.Color, bestOffW, bestOffB)))
		fmt.Println(minLineLength("Off W") + utils.Str(" "+color.OffW.Hex()+" ", nil, &color.OffW) + minLineLength(prettyContrast(color.OffW, bestOffW, bestOffB)))
		fmt.Println(minLineLength("Off B") + utils.Str(" "+color.OffB.Hex()+" ", nil, &color.OffB) + minLineLength(prettyContrast(color.OffB, bestOffW, bestOffB)))
		fmt.Println()

		var line1, line2, line3 string
		for _, shade := range color.Shades {
			contrast := prettyContrast(shade, bestOffW, bestOffB)
			line1 += minLineLength("Shades")
			line1 += prettyOtherColors(shade, minLineLength(contrast))

		}
		for _, tone := range color.Tones {
			contrast := prettyContrast(tone, bestOffW, bestOffB)
			line2 += minLineLength("Tones")
			line2 += prettyOtherColors(tone, minLineLength(contrast))

		}
		for _, tint := range color.Tints {
			contrast := prettyContrast(tint, bestOffW, bestOffB)
			line3 += minLineLength("Tints")
			line3 += prettyOtherColors(tint, minLineLength(contrast))

		}
		fmt.Println(line1)
		fmt.Println(line2)
		fmt.Println(line3 + "\n")
	}
}

func prettyContrast(color, offW, offB colorful.Color) string {
	return " L: " + prettyFloat(utils.ContrastRatio(color, offW)) + " D: " + prettyFloat(utils.ContrastRatio(color, offB)) + " "
}

func minLineLength(line string) string {
	if utf8.RuneCountInString(line) < 20 {
		for i := 0; i < 20-utf8.RuneCountInString(line); i++ {
			line += " "
		}
	}

	return line
}

func prettyOtherColors(color colorful.Color, text string) string {
	return utils.Str(" "+color.Hex()+" ", nil, &color) + text
}

func prettyFloat(f float64) string {
	return strconv.FormatFloat(f, 'f', 2, 64)
}
