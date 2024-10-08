package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"os"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

var TAB = constants.Tab(2)

func WriteTheme(
	config c.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	// Build in memory theme
	rootStart := "\n:root {\n" + TAB + "/* Root Variables */"
	rootTheme := ""
	rootTheme += "\n" + writeLine("opacity", strconv.FormatFloat(1.0, 'f', 0, 64), config.Prefix)
	rootTheme += "\n" + TAB + "background-color: rgba(var(--" + config.Prefix + "-bkgd), var(--" + config.Prefix + "-opacity));\n"
	rootEnd := "}\n"

	// Classes

	classes := ""

	darkStart := "\n." + config.Prefix + "-dark {\n" + TAB + "/* Dark Mode Variables */\n"
	darkTheme := ""
	darkEnd := "}\n"

	// Add palette vars
	writeLightPalette(&rootTheme, palette, config)
	writeDarkPalette(&darkTheme, palette, config)

	// Add harmony vars
	writePalette(&rootTheme, palette, config)

	// writeClasses(&classes, palette, config)

	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)
	writeGradient(&rootTheme, palette, config)

	fullTheme := rootStart + rootTheme + rootEnd + darkStart + darkTheme + darkEnd + classes

	// Write theme to file
	err := utils.WriteFile(config.Output, fullTheme)

	if err != nil {
		utils.Log.Error("Error writing theme to file: %s", err)
		os.Exit(0)
	}
}

// func writeClassLine(key, value, prefix, property string) string {
// 	return "." + prefix + "-" + key + " {\n" + TAB + property + ": rgba(var(--" + prefix + "-" + value + "), var(--" + prefix + "-opacity));\n" + "}\n"
// }

// func writeColorClasses(
// 	classes *string,
// 	config c.Config,
// 	colorKeys ...c.ColorKeys,
// ) {
// 	// if uc, ok := config.UseClasses.(c.UseClassesBool); ok && !bool(uc) {
// 	// 	return
// 	// }
// 	for _, cKey := range colorKeys {
// 		colorStart := string(cKey)
// 		bgStart := "bg-" + string(cKey)
// 		colors := []string{"-main", "-light", "-dark", "-grey", "-contrast"}
// 		paletteColors := []string{"-l1", "-l2", "-l3", "-l4", "-l5", "", "-d1", "-d2", "-d3", "-d4", "-d5", "-g1", "-g2", "-g3", "-g4"}

// 		// text color classes
// 		for _, color := range colors {
// 			*classes += writeClassLine(colorStart+color, colorStart+color, config.Prefix, "color")
// 		}

// 		// palette color classes
// 		for _, color := range paletteColors {
// 			*classes += writeClassLine(colorStart+color, colorStart+color, config.Prefix, "color")
// 			*classes += writeClassLine(bgStart+color, colorStart+color, config.Prefix, "background-color")
// 		}

// 	}

// 	// TODO: Move to seperate function
// 	// Opacity Class
// 	opacities := []string{"0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"}
// 	for i, opacity := range opacities {
// 		var op string
// 		if i == 0 {
// 			op = "0"
// 		} else if i == 10 {
// 			op = "1"
// 		} else {
// 			op = "." + opacity[0:1]
// 		}

// 		*classes += "." + config.Prefix + "-opacity-" + opacity + " {\n" + TAB + "--" + config.Prefix + "-opacity: " + op + ";\n" + "}\n"
// 	}
// 	*classes += "\n"
// }

// func getColorKey(i int) (c.ColorKeys, error) {
// 	switch i {
// 	case 0:
// 		return c.Primary, nil
// 	case 1:
// 		return c.Accent1, nil
// 	case 2:
// 		return c.Accent2, nil
// 	case 3:
// 		return c.Accent3, nil
// 	case 4:
// 		return c.Accent4, nil
// 	case 5:
// 		return c.Accent5, nil
// 	default:
// 		return "", errors.New("invalid color key")
// 	}
// }

// func getColorKeys(p Palette) []c.ColorKeys {
// 	var colorKeys []c.ColorKeys
// 	for i := range p.HarmonyPalette {
// 		if k, err := getColorKey(i); err == nil {
// 			colorKeys = append(colorKeys, k)
// 		}
// 	}
// 	return colorKeys
// }

// func writeClasses(classes *string, palette Palette, config c.Config) {
// 	*classes += "\n/* Classes */\n"
// 	var colorKeys []c.ColorKeys
// 	if uc, ok := config.UseClasses.(c.UseClassesT); ok {
// 		for colorKey, colorValue := range uc.Colors {
// 			if colorValue {
// 				colorKeys = append(colorKeys, colorKey)
// 			}
// 		}
// 		if len(colorKeys) == 0 {
// 			colorKeys = getColorKeys(palette)
// 		}
// 		writeColorClasses(classes, config, colorKeys...)
// 	}
// }

// func writePaletteVars(rootTheme *string, palette Palette, config config.Config) {
// 	*rootTheme += "\n\n" + TAB + "/* Palette Vars */\n"

// 	// Add harmony vars
// 	for i, harm := range palette.HarmonyPalette {
// 		keyStart := "color-" + strconv.Itoa(i)

// 	}
// }

func writeGradient(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Gradients */\n"

	*rootTheme += writeLine("direction", "to right", config.Prefix)

	colors := palette.HarmonyPalette
	colorsLen := len(colors)

	// Add harmony gradients
	for i := range colors {
		line := "linear-gradient(" + "\n" + TAB + TAB + "var(--at-direction),"
		if i < colorsLen-1 {
			for j := 0; j < 2; j++ {
				if j == 0 {
					line += "\n" + TAB + TAB + "rgba(var(--" + config.Prefix + "-color-0), var(--at-opacity)), "
				} else {
					line += "\n" + TAB + TAB + "rgba(var(--" + config.Prefix + "-color-" + strconv.Itoa(i+1) + "), var(--at-opacity)"
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

func writeNoise(rootTheme *string, noise string, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Noise */\n"

	*rootTheme += writeLine("noise", `url("`+noise+`")`, config.Prefix)
}

// TODO: SOMEETHING IS WRONG WITH THIS
func writeSpacing(rootTheme *string, scale []float64, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Spacing */\n"
	root := .25

	for i, size := range scale {
		*rootTheme += writeLine("spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	}

	// TODO: keep or remove?
	// *rootTheme += "\n" + TAB + "/* Mobile Spacing */\n"
	// root = 1.0 / 8.0

	// for i, size := range scale {
	// 	*rootTheme += writeLine("spacing-sm-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem", config.Prefix)
	// }

}

func writeTextSize(rootTheme *string, scale []float64, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Text Size */\n"

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

func writePalette(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Palette */\n"

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

func writeDarkPalette(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Dark Mode Text Colors */\n"
	*rootTheme += writeLine("bkgd", writeRgb(palette.OffBlack), config.Prefix) + "\n"

	for i, color := range palette.TextPalette.Dark {
		keyStart := "color-" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-main", writeRgb(color[Main]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light", writeRgb(color[Light]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color[Dark]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color[Neutral]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color[Contrast]), config.Prefix)
	}
}

func writeLightPalette(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Text Colors */\n"
	*rootTheme += writeLine("bkgd", writeRgb(palette.OffWhite), config.Prefix) + "\n"
	for i, color := range palette.TextPalette.Light {
		keyStart := "color-" + strconv.Itoa(i)

		*rootTheme += writeLine(keyStart+"-main", writeRgb(color[Main]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-light", writeRgb(color[Light]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-dark", writeRgb(color[Dark]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-grey", writeRgb(color[Neutral]), config.Prefix)
		*rootTheme += writeLine(keyStart+"-contrast", writeRgb(color[Contrast]), config.Prefix)
	}
}
