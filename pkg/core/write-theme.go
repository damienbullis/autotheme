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

func rgbVar(pre, key string) string {
	return "rgb(var(--" + pre + key + ") / var(--" + pre + "opacity))"
}

func WriteTheme(
	config c.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	pre := config.Prefix + "-"

	// Build in memory theme
	rootStart := "\n:root {\n" + TAB + "/* Root Variables */"
	rootTheme := ""
	rootTheme += "\n" + writeVar(pre+"opacity", strconv.FormatFloat(1.0, 'f', 0, 64))
	rootTheme += "\n" + TAB + "background-color: " + rgbVar(pre, "bkgd") + ";\n"
	rootEnd := "}\n"

	// Dark Mode
	// TODO: Should this use the prefix as well?
	darkClassName := "." + pre + "dark"

	darkStart := "\n" + darkClassName + " {\n" + TAB + "/* Dark Mode Variables */\n"
	darkTheme := ""
	darkEnd := "}\n"

	classesStart := "\n" + pre + " {\n" + TAB + "/* Utility Classes */\n"
	classes := ""
	classesEnd := "}\n"

	// Add palette vars
	writeDarkPalette(&darkTheme, palette, config)

	// Add harmony vars
	writePalette(&rootTheme, palette, config)

	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)
	writeGradient(&rootTheme, palette, config)

	// Utility Classes
	// only if tailwind === false
	writeUtilities(&classes, palette, config)

	fullTheme := rootStart + rootTheme + rootEnd +
		classesStart + classes + classesEnd +
		darkStart + darkTheme + darkEnd

	// Write theme to file
	err := utils.WriteFile(config.Output, fullTheme)

	if err != nil {
		utils.Log.Error("Error writing theme to file: %s", err)
		os.Exit(0)
	}
}

func v(s string, p *string) string {
	if p != nil {
		return "var(--" + *p + "-" + s + ")"
	}
	return "var(--" + s + ")"
}

func lg(s string) string {
	return "linear-gradient(" + s + ")"
}
func rg(s string) string {
	return "radial-gradient(" + s + ")"
}

func writeUtilities(classes *string, palette Palette, config c.Config) {
	pre := config.Prefix
	toFrom := writeVar(
		pre+"-stops",
		v("from", &pre)+" "+
			v("from-position", &pre)+", "+
			v("to", &pre)+" "+
			v("to-position", &pre)+";",
	)

	// linear
	*classes += "." + pre + "-linear {\n"
	*classes += TAB + toFrom
	*classes += TAB + "background-image: " + lg(
		v("direction", &pre)+", "+
			v("stops", &pre)) + ";\n"
	*classes += "}\n\n"

	// radial
	*classes += "." + pre + "-radial {\n"
	*classes += TAB + toFrom
	*classes += TAB + "background-image: " + rg(
		v("scale", &pre)+" at "+v("position", &pre)+", "+
			v("stops", &pre)) + ";\n"
	*classes += "}\n\n"
}

// FEATURE: Add blob gradients not just linear.
func writeGradient(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Gradients */\n"

	pre := config.Prefix
	*rootTheme += writeVar(pre+"-scale", "100% 100"+"%")
	*rootTheme += writeVar(pre+"-position", "50% 50"+"%")

	// only if tailwind === false
	if config.Tailwind == false {
		*rootTheme += writeVar(pre+"-direction", "to right")
		*rootTheme += writeVar(pre+"-from", "rgb("+v("c0", &pre)+" / "+v("opacity", &pre)+")")
		*rootTheme += writeVar(pre+"-from-position", "-20%")
		*rootTheme += writeVar(pre+"-to", "transparent")
		*rootTheme += writeVar(pre+"-to-position", "120%")
	}
}

func writeNoise(rootTheme *string, noise string, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Noise */\n"

	*rootTheme += writeVar(config.Prefix+"-noise", `url("`+noise+`")`)
}

func writeSpacing(rootTheme *string, scale []float64, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Spacing */\n"
	root := .25

	pre := config.Prefix + "-"
	for i, size := range scale {
		*rootTheme += writeVar(pre+"spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem")
	}
}

func writeTextSize(rootTheme *string, scale []float64, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Text Size */\n"

	pre := config.Prefix
	for i, cn := range []string{"xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"} {
		*rootTheme += writeVar(pre+"text-"+cn, strconv.FormatFloat(scale[i], 'f', 3, 64)+"rem")
	}
}

func writeVar(key, value string) string {
	return TAB + "--" + key + ": " + value + ";\n"
}

func writeRgb(value colorful.Color) string {
	r, g, b := value.Clamped().RGB255()
	return strconv.Itoa(int(r)) + " " + strconv.Itoa(int(g)) + " " + strconv.Itoa(int(b))
}

func writePalette(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Palette */\n"

	pre := config.Prefix + "-"
	light := palette.TextPalette.Light

	*rootTheme += writeVar(pre+"bkgd", writeRgb(palette.OffWhite))

	for i, harm := range palette.HarmonyPalette {
		key := "c" + strconv.Itoa(i)
		if i == 0 {
			*rootTheme += "\n" + TAB + "/* Primary */\n"
		} else if i == 1 {
			*rootTheme += "\n" + TAB + "/* Harmonies */\n"
		}

		// main
		*rootTheme += writeVar(pre+key, writeRgb(harm[Root]))
		// main text
		*rootTheme += writeVar(pre+key+"-text", writeRgb(light[i][Main]))
		*rootTheme += writeVar(pre+key+"-contrast", writeRgb(light[i][Contrast]))

		// light
		*rootTheme += writeVar(pre+key+"-l1", writeRgb(harm[Light1]))
		*rootTheme += writeVar(pre+key+"-l2", writeRgb(harm[Light2]))
		*rootTheme += writeVar(pre+key+"-l3", writeRgb(harm[Light3]))
		*rootTheme += writeVar(pre+key+"-l4", writeRgb(harm[Light4]))
		*rootTheme += writeVar(pre+key+"-l5", writeRgb(harm[Light5]))
		// light text
		*rootTheme += writeVar(pre+key+"-lt", writeRgb(light[i][Light]))

		// dark
		*rootTheme += writeVar(pre+key+"-d1", writeRgb(harm[Dark1]))
		*rootTheme += writeVar(pre+key+"-d2", writeRgb(harm[Dark2]))
		*rootTheme += writeVar(pre+key+"-d3", writeRgb(harm[Dark3]))
		*rootTheme += writeVar(pre+key+"-d4", writeRgb(harm[Dark4]))
		*rootTheme += writeVar(pre+key+"-d5", writeRgb(harm[Dark5]))
		// dark text
		*rootTheme += writeVar(pre+key+"-dt", writeRgb(light[i][Dark]))

		// grey
		*rootTheme += writeVar(pre+key+"-g1", writeRgb(harm[Grey1]))
		*rootTheme += writeVar(pre+key+"-g2", writeRgb(harm[Grey2]))
		*rootTheme += writeVar(pre+key+"-g3", writeRgb(harm[Grey3]))
		*rootTheme += writeVar(pre+key+"-g4", writeRgb(harm[Grey4]))
		// grey text
		*rootTheme += writeVar(pre+key+"-gt", writeRgb(light[i][Neutral]))

	}
}

func writeDarkPalette(rootTheme *string, palette Palette, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Dark Mode Colors */\n"
	pre := config.Prefix + "-"
	*rootTheme += writeVar(pre+"bkgd", writeRgb(palette.OffBlack)) + "\n"

	for i, color := range palette.TextPalette.Dark {
		key := "c" + strconv.Itoa(i)

		*rootTheme += writeVar(pre+key+"-text", writeRgb(color[Main]))
		*rootTheme += writeVar(pre+key+"-lt", writeRgb(color[Light]))
		*rootTheme += writeVar(pre+key+"-dt", writeRgb(color[Dark]))
		*rootTheme += writeVar(pre+key+"-gt", writeRgb(color[Neutral]))
		*rootTheme += writeVar(pre+key+"-contrast", writeRgb(color[Contrast]))
	}
}
