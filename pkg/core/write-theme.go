package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"os"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

var css = *utils.Css

var TAB = constants.Tab(2)

func rgbVar(pre, key string) string {
	return "rgb(var(--" + pre + key + ") / var(--" + pre + "opacity))"
}

func writeVar(key, value string) string {
	return TAB + "--" + key + ": " + value + ";\n"
}

func writeRgb(value colorful.Color) string {
	r, g, b := value.Clamped().RGB255()
	return strconv.Itoa(int(r)) + " " + strconv.Itoa(int(g)) + " " + strconv.Itoa(int(b))
}

func WriteTheme(
	config c.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	pre := config.Prefix + "-"

	rootStart := "\n:root {\n" + TAB + "/* Root Variables */"
	rootTheme := "\n" + writeVar(pre+"opacity", strconv.FormatFloat(1.0, 'f', 0, 64))
	rootEnd := "}\n"
	writePalette(&rootTheme, palette, config)
	writeGradient(&rootTheme, config)
	writeTextSize(&rootTheme, scale, config)
	writeSpacing(&rootTheme, scale, config)
	writeNoise(&rootTheme, noise, config)

	// Dark Mode
	darkClassName := "." + pre + "dark"
	darkStart := "\n" + darkClassName + " {\n" + TAB + "/* Dark Mode Variables */\n"
	darkTheme := ""
	darkEnd := "}\n"
	writeDarkPalette(&darkTheme, palette, config)

	// Utility Classes
	classes := ""
	writeUtilities(&classes, config)

	// Put it all together
	fullTheme := rootStart + rootTheme + rootEnd +
		classes +
		darkStart + darkTheme + darkEnd

	// Write theme to file
	err := utils.WriteFile(config.Output, fullTheme)

	if err != nil {
		utils.Log.Error("Error writing theme to file: %s", err)
		os.Exit(0)
	}
	css.Var("opacity", &pre)

	// Write tailwind config if needed
	WriteTailwind(config, palette, scale, noise)
}

func writeUtilities(classes *string, config c.Config) {
	*classes += "\n/* Utility Classes */\n\n"
	pre := config.Prefix
	toFrom := css.MakeVar(
		"stops",
		css.Var("from", &pre)+" "+
			css.Var("from-position", &pre)+", "+
			css.Var("to", &pre)+" "+
			css.Var("to-position", &pre),
		&pre,
	)

	// linear
	linearClass := css.Class("linear", &pre, nil)
	linearClass.Line(toFrom)
	linearClass.Line(css.Prop(
		"background-image",
		css.Linear(css.Var("direction", &pre)+", "+css.Var("stops", &pre)),
	))

	*classes += linearClass.Make()

	// radial
	radialClass := css.Class("radial", &pre, nil)
	radialClass.Line(toFrom)
	radialClass.Line(css.Prop(
		"background-image",
		css.Radial(css.Var("scale", &pre)+" at "+
			css.Var("position", &pre)+", "+
			css.Var("stops", &pre)),
	))
	*classes += radialClass.Make()

	opacity := css.Var("opacity", &pre)

	// text color
	textClass := css.Class("text", &pre, nil)
	textClass.Line(css.MakeVar("text", css.Var("c0", &pre), &pre))
	textClass.Line(css.Prop("color", css.Rgb(css.Var("text", &pre), &opacity)))
	*classes += textClass.Make()

	// background color
	bgClass := css.Class("bg", &pre, nil)
	bgClass.Line(css.MakeVar("bg", css.Var("c0", &pre), &pre))
	bgClass.Line(css.Prop("color", css.Rgb(css.Var("bg", &pre), &opacity)))
	*classes += bgClass.Make()

}

// TODO: leaving off here
func writeGradient(rootTheme *string, config c.Config) {
	*rootTheme += "\n" + TAB + "/* Gradients */\n"

	pre := config.Prefix
	*rootTheme += writeVar(pre+"-scale", "100% 100"+"%")
	*rootTheme += writeVar(pre+"-position", "50% 50"+"%")

	if !config.Tailwind {
		*rootTheme += writeVar(pre+"-direction", "to right")
		*rootTheme += writeVar(pre+"-from", "rgb("+css.Var("c0", &pre)+" / "+css.Var("opacity", &pre)+")")
		*rootTheme += writeVar(pre+"-from-position", "-20%")
		*rootTheme += writeVar(pre+"-to", "transparent")
		*rootTheme += writeVar(pre+"-to-position", "120%")
	}
}

func writeNoise(rootTheme *string, noise string, config c.Config) {
	if config.Tailwind {
		// Tailwind handles noise
		return
	}

	*rootTheme += "\n" + TAB + "/* Noise */\n"
	*rootTheme += writeVar(config.Prefix+"-noise", `url("`+noise+`")`)
}

func writeSpacing(rootTheme *string, scale []float64, config c.Config) {
	if config.Tailwind {
		// Tailwind handles spacing
		return
	}
	*rootTheme += "\n" + TAB + "/* Spacing */\n"
	root := .25

	pre := config.Prefix + "-"
	for i, size := range scale {
		*rootTheme += writeVar(pre+"spacing-"+strconv.Itoa(i+1), strconv.FormatFloat(size*root, 'f', 3, 64)+"rem")
	}
}

func writeTextSize(rootTheme *string, scale []float64, config c.Config) {
	if config.Tailwind {
		// Tailwind handles text sizes
		return
	}

	*rootTheme += "\n" + TAB + "/* Text Size */\n"

	pre := config.Prefix
	for i, cn := range []string{"xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"} {
		*rootTheme += writeVar(pre+"text-"+cn, strconv.FormatFloat(scale[i], 'f', 3, 64)+"rem")
	}
}

func writePalette(rootTheme *string, palette Palette, config c.Config) {
	pre := config.Prefix + "-"
	light := palette.TextPalette.Light

	if !config.Tailwind {
		*rootTheme += "\n" + TAB + "background-color: " + rgbVar(pre, "bkgd") + ";\n"
	}

	*rootTheme += "\n" + TAB + "/* Palette */\n"
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
	if !config.DarkMode {
		// Dark mode is off
		return
	}

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
