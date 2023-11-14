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
	gradients [][]colorful.Color,
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

	// Add harmony vars
	writeHarmony(&rootTheme, palette, config)

	writeScale(&rootTheme, scale, config)
	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)

	// rootTheme += "\n" + TAB + "/* Properties */\n"
	// rootTheme += TAB + "font-size: var(--" + config.Prefix + "-text-root);\n"

	// NEXT: add noise vars
	// NEXT: add gradient vars

	// Check theme string
	fmt.Println(rootStart + rootTheme + rootEnd)

	// Write theme to file

}

func writeSpacing(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Spacing */\n"

	// TODO: Add in config option for root spacing?
	root := 4.0

	for i, size := range scale {
		*rootTheme += writeLine("spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"px", config.Prefix)
	}
}

func writeTextSize(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Text Size */\n"

	// TODO: Add in config option for root text size?
	root := 16.0

	*rootTheme += writeLine("text-xs", strconv.FormatFloat(scale[0]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-sm", strconv.FormatFloat(scale[1]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-md", strconv.FormatFloat(scale[2]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-lg", strconv.FormatFloat(scale[3]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-xl", strconv.FormatFloat(scale[4]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-2xl", strconv.FormatFloat(scale[5]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-3xl", strconv.FormatFloat(scale[6]*root, 'f', 3, 64)+"px", config.Prefix)
	*rootTheme += writeLine("text-4xl", strconv.FormatFloat(scale[7]*root, 'f', 3, 64)+"px", config.Prefix)

}

func writeLine(key, value string, prefix string) string {
	return TAB + "--" + prefix + "-" + key + ": " + value + ";\n"
}

func writeRgb(value *colorful.Color) string {
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
		*rootTheme += writeLine(keyStart+"-light1", writeRgb(&harm.Light1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light2", writeRgb(&harm.Light2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light3", writeRgb(&harm.Light3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light4", writeRgb(&harm.Light4), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light5", writeRgb(&harm.Light5), config.Prefix)

		// base
		*rootTheme += writeLine(keyStart+"-main", writeRgb(&harm.Main), config.Prefix)

		// dark
		*rootTheme += writeLine(keyStart+"-dark1", writeRgb(&harm.Dark1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark2", writeRgb(&harm.Dark2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark3", writeRgb(&harm.Dark3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark4", writeRgb(&harm.Dark4), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark5", writeRgb(&harm.Dark5), config.Prefix)

		// gray
		*rootTheme += writeLine(keyStart+"-gray1", writeRgb(&harm.Gray1), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray2", writeRgb(&harm.Gray2), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray3", writeRgb(&harm.Gray3), config.Prefix)
		*rootTheme += writeLine(keyStart+"-gray4", writeRgb(&harm.Gray4), config.Prefix)

	}
}

func writeDarkPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Dark Palette */\n"
	*rootTheme += writeLine("dark-bkgd", writeRgb(&palette.Dark.Background), config.Prefix)

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

		*rootTheme += writeLine(keyStart+"-light", writeRgb(&color.Light), config.Prefix)
		*rootTheme += writeLine(keyStart+"-main", writeRgb(&color.Main), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(&color.Dark), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(&color.Neutral), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(&color.Contrast), config.Prefix)
	}
}

func writeLightPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Light Palette */\n"
	*rootTheme += writeLine("light-bkgd", writeRgb(&palette.Light.Background), config.Prefix)
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

		*rootTheme += writeLine(keyStart+"-light", writeRgb(&color.Light), config.Prefix)
		*rootTheme += writeLine(keyStart+"-main", writeRgb(&color.Main), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(&color.Dark), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(&color.Neutral), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(&color.Contrast), config.Prefix)
	}
}
