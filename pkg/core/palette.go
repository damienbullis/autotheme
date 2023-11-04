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

type TextColors struct {
	Text     []colorful.Color
	DarkText []colorful.Color
}

type VariantMode struct {
	Main     colorful.Color
	Light    colorful.Color
	Dark     colorful.Color
	Neutral  colorful.Color
	Contrast colorful.Color
}

type TextVariants struct {
	__color   colorful.Color
	LightMode VariantMode
	DarkMode  VariantMode
}

type Palette struct {
	Primary  ColorType
	Harmony  ColorType
	Harmony2 *ColorType
	Harmony3 *ColorType
	Harmony4 *ColorType
	Harmony5 *ColorType
}

type PaletteVars struct {
	Text     TextVariants
	OffWhite colorful.Color
	OffBlack colorful.Color
	Harmony  Palette
}

// Calc the contrast ratio of the colors based on the best off white and black colors
// [WCAG 2.2 AAA](https://www.w3.org/TR/WCAG22/#contrast-minimum)
// Text = 7:1 / Large Text = 4.5:1

func GeneratePalette(config *config.Config) PaletteVars {
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
	fmt.Println("\nHarmony: ", harmony, "\nColor: ", hex.Hex())
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

	return PaletteVars{
		// NEXT: Add function to create this
		Text: TextVariants{
			__color:   hex,
			LightMode: VariantMode{},
			DarkMode:  VariantMode{},
		},
		Harmony:  *newPalette(palette),
		OffWhite: bestOffW,
		OffBlack: bestOffB,
	}
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

func newPalette(palette []ColorType) *Palette {
	p := &Palette{}

	for i, color := range palette {
		switch i {
		case 0:
			p.Primary = color
		case 1:
			p.Harmony = color
		case 2:
			p.Harmony2 = &color
		case 3:
			p.Harmony3 = &color
		case 4:
			p.Harmony4 = &color
		case 5:
			p.Harmony5 = &color
		}
	}

	return p
}
