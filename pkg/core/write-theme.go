package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"os"
	"path/filepath"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

var TAB = constants.Tab(2)

func WriteTheme(
	config config.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	// Build in memory theme
	rootStart := "\n:root {\n" + TAB + "/* Root Variables */"
	rootTheme := ""
	rootTheme += "\n" + writeLine("opacity", strconv.FormatFloat(1.0, 'f', 1, 64), config.Prefix)
	rootEnd := "}\n"

	darkStart := "\n.dark-mode {\n" + TAB + "/* Dark Mode Variables */"
	darkTheme := ""
	darkEnd := "}\n"

	// Add palette vars
	writeLightPalette(&rootTheme, palette, config)
	writeDarkPalette(&darkTheme, palette, config)

	// Add harmony vars
	writePalette(&rootTheme, palette, config)
	// writePaletteVars(&rootTheme, palette, config)

	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)
	writeGradient(&rootTheme, palette, config)

	// TODO: Add in generate classes
	// TODO: Add in html file generation
	// TODO: Add in json data? for contrast ratios?**** not sure about this one

	fullTheme := rootStart + rootTheme + rootEnd + darkStart + darkTheme + darkEnd
	// Check theme string
	// fmt.Println(fullTheme)

	// Write theme to file
	err := writeFile(config.Output, fullTheme)

	if err != nil {
		utils.Log.Error("Error writing theme to file: %s", err)
		os.Exit(0)
	}
}

func writeFile(output string, content string) error {
	outputPath, filename := filepath.Split(output)
	// Ensure the output path exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		err := os.MkdirAll(outputPath, 0755)
		if err != nil {
			return err
		}
	}

	// Check if the file already exists
	filePath := filepath.Join(outputPath, filename)
	if _, err := os.Stat(filePath); err == nil {
		utils.Log.Warn(utils.FgStr("grey", "Overwriting your previous %s..."), filename)
	}

	// Create or open the file
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	// Write the content to the file
	_, err = file.WriteString(content)
	if err != nil {
		return err
	}

	return nil
}

// func writePaletteVars(rootTheme *string, palette Palette, config config.Config) {
// 	*rootTheme += "\n\n" + TAB + "/* Palette Vars */\n"

// 	// Add harmony vars
// 	for i, harm := range palette.HarmonyPalette {
// 		keyStart := "color-" + strconv.Itoa(i)

// 	}
// }

func writeGradient(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Gradients */\n"

	*rootTheme += writeLine("direction", "to right", config.Prefix)

	colors := palette.HarmonyPalette
	colorsLen := len(colors)

	// Add harmony gradients
	for i := range colors {
		line := "linear-gradient(" + "\n" + TAB + TAB + "var(--at-direction),"
		if i < colorsLen-1 {
			for j := 0; j < 2; j++ {
				if j == 0 {
					line += "\n" + TAB + TAB + "rgba(var(--" + config.Prefix + "-harmony0-main), var(--at-opacity)), "
				} else {
					line += "\n" + TAB + TAB + "rgba(var(--" + config.Prefix + "-harmony" + strconv.Itoa(i+1) + "-main), var(--at-opacity)"
				}
			}

			line += ")\n" + TAB + ")"
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

	line := "linear-gradient(" + "\n" + TAB + TAB + "var(--at-direction),"
	// Add rainbow gradient last
	for j, c := range rainbow {
		line += "\n" + TAB + TAB + "rgba(" + writeRgb(c) + ", var(--at-opacity))"

		if j < rainbowLen-1 {
			line += ","
		}
	}
	line += "\n" + TAB + ")"
	*rootTheme += writeLine("gradient-"+strconv.Itoa(colorsLen), line, config.Prefix)

}

func writeNoise(rootTheme *string, noise string, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Noise */\n"

	*rootTheme += writeLine("noise", `url("`+noise+`")`, config.Prefix)
}

func writeSpacing(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Spacing */\n"

	root := .25

	for i, size := range scale {
		*rootTheme += writeLine("spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	}
	*rootTheme += "\n" + TAB + "/* Mobile Spacing */\n"

	root = 1.0 / 8.0
	for i, size := range scale {
		*rootTheme += writeLine("spacing-sm-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	}

}

func writeTextSize(rootTheme *string, scale []float64, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Text Size */\n"

	for i, cn := range []string{"xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"} {
		*rootTheme += writeLine("text-"+cn, strconv.FormatFloat(scale[i], 'f', 3, 64)+"rem", config.Prefix)
	}
}

func writeLine(key, value string, prefix string) string {
	return TAB + "--" + prefix + "-" + key + ": " + value + ";\n"
}

func writeRgb(value colorful.Color) string {
	r, g, b := value.Clamped().RGB255()
	return strconv.Itoa(int(r)) + ", " + strconv.Itoa(int(g)) + ", " + strconv.Itoa(int(b))

}

func writePalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Palette */\n"

	for i, harm := range palette.HarmonyPalette {

		keyStart := "color-" + strconv.Itoa(i)

		// light
		*rootTheme += writeLine(keyStart+"-l1", writeRgb(harm[Light1]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-l2", writeRgb(harm[Light2]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-l3", writeRgb(harm[Light3]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-l4", writeRgb(harm[Light4]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-l5", writeRgb(harm[Light5]), config.Prefix)

		// base
		*rootTheme += writeLine(keyStart, writeRgb(harm[Root]), config.Prefix)

		// dark
		*rootTheme += writeLine(keyStart+"-d1", writeRgb(harm[Dark1]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-d2", writeRgb(harm[Dark2]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-d3", writeRgb(harm[Dark3]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-d4", writeRgb(harm[Dark4]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-d5", writeRgb(harm[Dark5]), config.Prefix)

		// gray
		*rootTheme += writeLine(keyStart+"-g1", writeRgb(harm[Gray1]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-g2", writeRgb(harm[Gray2]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-g3", writeRgb(harm[Gray3]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-g4", writeRgb(harm[Gray4]), config.Prefix)

	}
}

func writeDarkPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Dark Mode Text Colors */\n"
	*rootTheme += writeLine("bkgd", writeRgb(palette.OffBlack), config.Prefix) + "\n"

	for i, color := range palette.TextPalette.Dark {
		keyStart := "text-" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-light", writeRgb(color[Light]), config.Prefix)
		*rootTheme += writeLine(keyStart, writeRgb(color[Main]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color[Dark]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color[Neutral]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color[Contrast]), config.Prefix)
	}
}

func writeLightPalette(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n\n" + TAB + "/* Text Colors */\n"
	*rootTheme += writeLine("bkgd", writeRgb(palette.OffWhite), config.Prefix) + "\n"
	for i, color := range palette.TextPalette.Light {
		keyStart := "text-" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-light", writeRgb(color[Light]), config.Prefix)
		*rootTheme += writeLine(keyStart+"", writeRgb(color[Main]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color[Dark]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color[Neutral]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color[Contrast]), config.Prefix)
	}
}
