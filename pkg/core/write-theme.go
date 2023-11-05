package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/utils"
	"fmt"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
	// "fmt"
	// "strconv"
)

const TAB = "    "

func WriteTheme(palette Palette, config *config.Config) {
	fmt.Printf("\nGenerating your " + config.Harmony + " theme...\n")

	light := []*TextColorType{}
	dark := []*TextColorType{}
	light = append(light, &palette.Light.Harmony0)
	light = append(light, &palette.Light.Harmony1)
	light = append(light, palette.Light.Harmony2)
	light = append(light, palette.Light.Harmony3)
	light = append(light, palette.Light.Harmony4)
	light = append(light, palette.Light.Harmony5)
	dark = append(dark, &palette.Dark.Harmony0)
	dark = append(dark, &palette.Dark.Harmony1)
	dark = append(dark, palette.Dark.Harmony2)
	dark = append(dark, palette.Dark.Harmony3)
	dark = append(dark, palette.Dark.Harmony4)
	dark = append(dark, palette.Dark.Harmony5)
	fmt.Println("\n» Text Colors:")
	fmt.Println(utils.Str(TAB+"These colors should be used for text elements (text, icons, etc.)", &colorful.Color{R: 0.5, G: 0.5, B: 0.5}, nil))

	fmt.Println("\n" + TAB + "Light Mode")
	fmt.Println()
	for i, color := range light {
		if color == nil {
			continue
		}
		str := TAB + strconv.Itoa(i) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		fmt.Println(str)
	}

	fmt.Println("\n" + TAB + "Dark Mode")
	fmt.Println()
	for i, color := range dark {
		if color == nil {
			continue
		}

		str := TAB + strconv.Itoa(i) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		fmt.Println(str)
	}

	fmt.Printf("\n» Harmony Palette:\n")
	fmt.Println(utils.Str(TAB+"These colors should be used for non-text elements (backgrounds, borders, etc.)", &colorful.Color{R: 0.5, G: 0.5, B: 0.5}, nil))
	fmt.Println()

	harmony := []*HarmonyColorType{}
	harmony = append(harmony, &palette.Harmony.Harmony0)
	harmony = append(harmony, &palette.Harmony.Harmony1)
	harmony = append(harmony, palette.Harmony.Harmony2)
	harmony = append(harmony, palette.Harmony.Harmony3)
	harmony = append(harmony, palette.Harmony.Harmony4)
	harmony = append(harmony, palette.Harmony.Harmony5)

	for i, color := range harmony {
		if color == nil {
			continue
		}

		str, str2 := TAB+strconv.Itoa(i)+": ", "\n"+TAB+"   "
		str += utils.Str("         ", nil, &color.Dark5)
		str += utils.Str("         ", nil, &color.Dark4)
		str += utils.Str("         ", nil, &color.Dark3)
		str += utils.Str("         ", nil, &color.Dark2)
		str += utils.Str("         ", nil, &color.Dark1)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Light1)
		str += utils.Str("         ", nil, &color.Light2)
		str += utils.Str("         ", nil, &color.Light3)
		str += utils.Str("         ", nil, &color.Light4)
		str += utils.Str("         ", nil, &color.Light5)

		str2 += utils.Str("         ", nil, &color.Gray1)
		str2 += utils.Str("         ", nil, &color.Gray2)
		str2 += utils.Str("         ", nil, &color.Gray3)
		str2 += utils.Str("         ", nil, &color.Gray4)

		fmt.Println(str, str2)
		fmt.Println()
	}

	// Build in memory theme
	// themeLine := TAB + `--at-harmony-primary: ` + _color + ";\n"
	// rootStart := "\n:root {\n"
	// rootTheme := ""
	// rootEnd := "}\n"

	// text := palette.Text
	// offWhite := palette.OffWhite
	// offBlack := palette.OffBlack

	// // Text colors
	// rootTheme += TAB + `--at-text-primary: ` + text.LightMode.Main.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-light: ` + text.LightMode.Light.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-dark: ` + text.LightMode.Dark.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-neutral: ` + text.LightMode.Neutral.Hex() + ";\n"

	// harmonyPalette := palette.Harmony
	// for i, color := range harmonyPalette.Primary.Shades {
	// 	rootTheme += TAB + `--at-harmony-dark-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }
	// for i, color := range harmonyPalette.Primary.Tones {
	// 	rootTheme += TAB + `--at-harmony-neutral-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }
	// for i, color := range harmonyPalette.Primary.Tints {
	// 	rootTheme += TAB + `--at-harmony-light-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }

	// rootTheme += TAB + `--at-primary: ` + palette.Harmony.Primary.Color.Hex() + ";\n"

	// rootTheme += TAB + `--at-white: ` + offWhite.Hex() + ";\n"
	// rootTheme += TAB + `--at-black: ` + offBlack.Hex() + ";\n"

	// fmt.Println(rootStart + rootTheme + rootEnd)
}
