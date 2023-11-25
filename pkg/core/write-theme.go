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
	rootEnd := "}\n"

	darkStart := "\n\n.dark-mode {\n" + TAB + "/* Dark Mode Variables */"
	darkTheme := ""
	darkEnd := "}\n"

	// Add palette vars
	writeLightPalette(&rootTheme, palette, config)
	writeDarkPalette(&rootTheme, palette, config)
	writeColorScheme(&rootTheme, &darkTheme, palette, config)

	// Add harmony vars
	writeHarmony(&rootTheme, palette, config)

	writeScale(&rootTheme, scale, config)
	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)
	writeGradient(&rootTheme, palette, config)

	fullTheme := rootStart + rootTheme + rootEnd + darkStart + darkTheme + darkEnd
	// Check theme string
	// fmt.Println(fullTheme)

	// Write theme to file
	err := writeFile(config.Output, fullTheme)

	if err != nil {
		utils.Log.Error("Error writing theme to file: %s", err)
		os.Exit(0)
	}
	utils.Log.Info(
		"'%s' %s %s",
		config.Output,
		utils.FgStr("grey", "generated..."),
		utils.FgStr("green", constants.IconCheck.Str()),
	)
	utils.Log.Debug(
		"[ %s ] '%s' created successfully.",
		constants.StageDone,
		config.Output,
	)

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
		utils.Log.Warn("Overwriting your previous %s...", filename)
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

func writeColorScheme(
	rootTheme *string,
	darkTheme *string,
	palette Palette,
	config config.Config,
) {

	keywords := []string{
		"-main",
		"-dark",
		"-light",
		"-contrast",
		"-grey",
	}

	*rootTheme += "\n" + TAB + "/* Color Scheme */\n"
	harmony := palette.Harmony.GetColors()

	for i := 0; i < len(harmony); i++ {
		for _, keyword := range keywords {
			k := keyword
			if k == "-main" {
				k = ""
			}
			key := "text-" + strconv.Itoa(i) + k
			val := "rgba(var(--" + config.Prefix + "-light" + strconv.Itoa(i) + keyword + "), var(--" + config.Prefix + "-opacity))"
			*rootTheme += writeLine(key, val, config.Prefix)
		}
	}

	// First, is the light theme
	// example: --at-text0-main: rgba(var(--at-light0-main), var(--at-opacity));
	// other possible: --at-text-0-

	// Second, is the dark theme
	if config.Darkmode {
		*darkTheme += "\n" + TAB + "/* Color Scheme */\n"
		for i := 0; i < len(harmony); i++ {
			for _, keyword := range keywords {
				k := keyword
				if k == "-main" {
					k = ""
				}
				key := "text-" + strconv.Itoa(i) + k
				val := "rgba(var(--" + config.Prefix + "-dark" + strconv.Itoa(i) + keyword + "), var(--" + config.Prefix + "-opacity))"
				*darkTheme += writeLine(key, val, config.Prefix)
			}
		}
	}
}

func writeGradient(rootTheme *string, palette Palette, config config.Config) {
	*rootTheme += "\n" + TAB + "/* Gradients */\n"

	*rootTheme += writeLine("direction", "to right", config.Prefix)

	colors := palette.Harmony.GetColors()
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
	*rootTheme += "\n" + TAB + "/* Text Size */\n"

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
