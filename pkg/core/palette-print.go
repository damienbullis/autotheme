package core

import (
	"autotheme/pkg/utils"
	"fmt"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

func PrintPalette(palette *Palette) {
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
		str := TAB + strconv.Itoa(i+1) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		fmt.Println(str + "\n")
	}

	fmt.Println("\n" + TAB + "Dark Mode")
	fmt.Println()
	for i, color := range dark {
		if color == nil {
			continue
		}

		str := TAB + strconv.Itoa(i+1) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		fmt.Println(str + "\n")
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

		str, str2 := TAB+strconv.Itoa(i+1)+": ", "\n"+TAB+"   "

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
}
