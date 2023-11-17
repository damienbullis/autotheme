package core

import (
	"autotheme/pkg/config"
	"fmt"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

const TAB = "    "

func WriteTheme(
	config config.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	fmt.Printf("\nWriting your " + config.Harmony + " theme to " + config.Output + "...\n")
	// Build in memory theme
	rootStart := "\n:root {\n"
	rootTheme := ""
	rootEnd := "}\n"

	// Add palette vars
	writeLightPalette(&rootTheme, palette, config)
	writeDarkPalette(&rootTheme, palette, config)
	// NEXT: add prefer-color-scheme (darkmode) vars

	writeColorScheme(&rootTheme, palette, config)

	// Add harmony vars
	writeHarmony(&rootTheme, palette, config)

	writeScale(&rootTheme, scale, config)
	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)
	writeGradient(&rootTheme, palette, config)

	// Check theme string
	fmt.Println(rootStart + rootTheme + rootEnd)

	// Write theme to file

}

func writeColorScheme(rootTheme *string, palette Palette, config config.Config) {
}

func writeGradient(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Gradients */\n"

	*rootTheme += writeLine("direction", "to right", config.Prefix)

	colors := palette.Harmony.GetColors()
	colorsLen := len(colors)

	// Add harmony gradients
	for i := range colors {
		line := "linear-gradient(" + "var(--at-direction), "
		if i < colorsLen-1 {
			for j := 0; j < 2; j++ {
				if j == 0 {
					line += "rgba(var(--" + config.Prefix + "-harmony0-main), var(--at-opacity)), "
				} else {
					line += "rgba(var(--" + config.Prefix + "-harmony" + strconv.Itoa(i+1) + "-main), var(--at-opacity)"
				}
			}

			line += ")"
			*rootTheme += writeLine("gradient-"+strconv.Itoa(i+1), line, config.Prefix)

		}
	}

	// Add rainbow gradient
	rainbow := []colorful.Color{
		{R: 1, G: 0, B: 0},
		{R: 1, G: 0.5, B: 0},
		{R: 1, G: 1, B: 0},
		{R: 0, G: 1, B: 0},
		{R: 0, G: 0, B: 1},
		{R: 0.29, G: 0, B: 0.51},
		{R: 0.55, G: 0, B: 1},
	}
	rainbowLen := len(rainbow)

	line := "linear-gradient(" + "var(--at-direction), "
	// Add rainbow gradient last
	for j, c := range rainbow {
		line += "rgba(" + writeRgb(c) + ", var(--at-opacity))"

		if j < rainbowLen-1 {

			line += ", "
		}
	}
	line += ")"
	*rootTheme += writeLine("gradient-"+strconv.Itoa(colorsLen), line, config.Prefix)

}

func writeNoise(rootTheme *string, noise string, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Noise */\n"

	*rootTheme += writeLine("noise", `url("`+noise+`")`, config.Prefix)
}

func writeSpacing(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Spacing */\n"

	root := .25

	for i, size := range scale {
		*rootTheme += writeLine("spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	}
	*rootTheme += "\n"

	root = 1.0 / 8.0
	for i, size := range scale {
		*rootTheme += writeLine("spacing-sm-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	}

}

func writeTextSize(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Text Size */"

	*rootTheme += "\n" + TAB + "font-size: " + strconv.Itoa(config.RootFont) + "px;\n"

	*rootTheme += writeLine("text-xs", strconv.FormatFloat(scale[0], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-sm", strconv.FormatFloat(scale[1], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-md", strconv.FormatFloat(scale[2], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-lg", strconv.FormatFloat(scale[3], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-xl", strconv.FormatFloat(scale[4], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-2xl", strconv.FormatFloat(scale[5], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-3xl", strconv.FormatFloat(scale[6], 'f', 3, 64)+"rem", config.Prefix)
	*rootTheme += writeLine("text-4xl", strconv.FormatFloat(scale[7], 'f', 3, 64)+"rem", config.Prefix)

}

func writeLine(key, value string, prefix string) string {
	return TAB + "--" + prefix + "-" + key + ": " + value + ";\n"
}

func writeRgb(value colorful.Color) string {
	r, g, b := value.Clamped().RGB255()
	return strconv.Itoa(int(r)) + ", " + strconv.Itoa(int(g)) + ", " + strconv.Itoa(int(b))

}

func writeScale(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Scale */\n"

	for i, scale := range scale {
		*rootTheme += writeLine("scale-"+strconv.Itoa(i+1), strconv.FormatFloat(scale, 'f', 3, 64), config.Prefix)
	}

}

func writeHarmony(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Harmony */\n"

	for i, harm := range []*HarmonyColorType{
		&palette.Harmony.Harmony0,
		&palette.Harmony.Harmony1,
		palette.Harmony.Harmony2,
		palette.Harmony.Harmony3,
		palette.Harmony.Harmony4,
		palette.Harmony.Harmony5,
	} {
		if harm == nil {
			continue
		}

		keyStart := "harmony" + strconv.Itoa(i)

		// light
		*rootTheme += writeLine(keyStart+"-light1", writeRgb(harm.Light1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light2", writeRgb(harm.Light2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light3", writeRgb(harm.Light3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light4", writeRgb(harm.Light4), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light5", writeRgb(harm.Light5), config.Prefix)

		// base
		*rootTheme += writeLine(keyStart+"-main", writeRgb(harm.Main), config.Prefix)

		// dark
		*rootTheme += writeLine(keyStart+"-dark1", writeRgb(harm.Dark1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark2", writeRgb(harm.Dark2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark3", writeRgb(harm.Dark3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark4", writeRgb(harm.Dark4), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark5", writeRgb(harm.Dark5), config.Prefix)

		// gray
		*rootTheme += writeLine(keyStart+"-gray1", writeRgb(harm.Gray1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray2", writeRgb(harm.Gray2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray3", writeRgb(harm.Gray3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray4", writeRgb(harm.Gray4), config.Prefix)

	}
}

func writeDarkPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Dark Palette */\n"
	*rootTheme += writeLine("dark-bkgd", writeRgb(palette.Dark.Background), config.Prefix)

	for i, color := range []*TextColorType{
		&palette.Dark.Harmony0,
		&palette.Dark.Harmony1,
		palette.Dark.Harmony2,
		palette.Dark.Harmony3,
		palette.Dark.Harmony4,
		palette.Dark.Harmony5,
	} {
		if color == nil {
			continue
		}

		keyStart := "dark" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-light", writeRgb(color.Light), config.Prefix)
		*rootTheme += writeLine(keyStart+"-main", writeRgb(color.Main), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color.Dark), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color.Neutral), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color.Contrast), config.Prefix)
	}
}

func writeLightPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Light Palette */\n"
	*rootTheme += writeLine("light-bkgd", writeRgb(palette.Light.Background), config.Prefix)
	for i, color := range []*TextColorType{
		&palette.Light.Harmony0,
		&palette.Light.Harmony1,
		palette.Light.Harmony2,
		palette.Light.Harmony3,
		palette.Light.Harmony4,
		palette.Light.Harmony5,
	} {
		if color == nil {
			continue
		}

		keyStart := "light" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-light", writeRgb(color.Light), config.Prefix)
		*rootTheme += writeLine(keyStart+"-main", writeRgb(color.Main), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color.Dark), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color.Neutral), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color.Contrast), config.Prefix)
	}
}
