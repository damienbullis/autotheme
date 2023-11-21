package print

import (
	c "autotheme/pkg/constants"
	"autotheme/pkg/core"
	"autotheme/pkg/utils"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

func PrintPalette(palette core.Palette) (string, string) {
	light := []*core.TextColorType{
		&palette.Light.Harmony0,
		&palette.Light.Harmony1,
		palette.Light.Harmony2,
		palette.Light.Harmony3,
		palette.Light.Harmony4,
		palette.Light.Harmony5,
	}
	dark := []*core.TextColorType{
		&palette.Dark.Harmony0,
		&palette.Dark.Harmony1,
		palette.Dark.Harmony2,
		palette.Dark.Harmony3,
		palette.Dark.Harmony4,
		palette.Dark.Harmony5,
	}
	line := "Text Colors: \n"

	line += utils.Str(core.TAB+"These colors should be used for text elements (text, icons, etc.)\n", &colorful.Color{R: 0.5, G: 0.5, B: 0.5}, nil)

	line += "\n" + core.TAB + c.IconLight.Str() + " Light Mode\n\n"
	for i, color := range light {
		if color == nil {
			continue
		}
		str := core.TAB + strconv.Itoa(i+1) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		line += str + "\n"
	}

	line += "\n" + core.TAB + c.IconDark.Str() + " Dark Mode\n\n"
	for i, color := range dark {
		if color == nil {
			continue
		}

		str := core.TAB + strconv.Itoa(i+1) + ": "
		str += utils.Str("         ", nil, &color.Light)
		str += utils.Str(" "+color.Main.Hex()+" ", nil, &color.Main)
		str += utils.Str("         ", nil, &color.Dark)
		str += utils.Str("         ", nil, &color.Neutral)
		str += utils.Str("         ", nil, &color.Contrast)

		line += str + "\n"
	}

	line2 := "Harmony Palette:\n"
	line2 += utils.Str(core.TAB+"These colors should be used for non-text elements (backgrounds, borders, etc.)\n", &colorful.Color{R: 0.5, G: 0.5, B: 0.5}, nil) + "\n"

	for i, color := range palette.Harmony.GetColors() {
		str, str2 := core.TAB+strconv.Itoa(i+1)+": ", "\n"+core.TAB+"   "

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

		line2 += str + str2 + "\n"
	}

	return line, line2
}
