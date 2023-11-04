package utils

import (
	"fmt"
	"strconv"
	"unicode/utf8"

	"github.com/lucasb-eyer/go-colorful"
)

func PreviewTheme(colors []colorful.Color) {
	// Build shades / tints / tones / offWB
	for i, color := range colors {
		h, s, _ := color.Hsl()
		title := "\nColor " + strconv.Itoa(i+1) + " : " + color.Hex() + "     \n"
		fmt.Println(title)
		titleLen := utf8.RuneCountInString(title)

		// Calculate shades / tints / tones / offWB
		shades := CalcShades(color, 5)
		tones := CalcTones(color, 5)
		tints := CalcTints(color, 5)
		offW := colorful.Hsl(h, s, 0.9667)
		offB := colorful.Hsl(h, s, 0.0333)

		// Printing
		var _len = 0

		shadesStr := "Shades "
		_len = utf8.RuneCountInString(shadesStr)
		for i := 0; i < (titleLen - _len); i++ {
			shadesStr += "-"
		}
		shadesStr += " "
		for _, shade := range shades {
			shadesStr += colorStr(shade)
		}
		fmt.Println(shadesStr)

		tonesStr := "Tones "
		_len = utf8.RuneCountInString(tonesStr)
		for i := 0; i < (titleLen - _len); i++ {
			tonesStr += "-"
		}
		tonesStr += " "
		for _, tone := range tones {
			tonesStr += colorStr(tone)
		}
		fmt.Println(tonesStr)

		tintsStr := "Tints "
		_len = utf8.RuneCountInString(tintsStr)
		for i := 0; i < (titleLen - _len); i++ {
			tintsStr += "-"
		}
		tintsStr += " "
		for _, tint := range tints {
			tintsStr += colorStr(tint)
		}
		fmt.Println(tintsStr)

		offWBStr := "Off-White / Off-Black "
		_len = utf8.RuneCountInString(offWBStr)
		for i := 0; i < (titleLen - _len); i++ {
			offWBStr += "-"
		}
		offWBStr += " " + colorStr(offW) + colorStr(offB)
		fmt.Println(offWBStr)
	}

}

func colorStr(color colorful.Color) string {
	return Str(
		" "+color.Hex()+" ",
		nil,
		&color,
	)
}
