package utils

import (
	"strconv"
)

type Color struct{ R, G, B int }

var reset = "\x1b[0m"

func fg(color Color) string {
	return "\x1b[38;2;" + strconv.Itoa(color.R) + ";" + strconv.Itoa(color.G) + ";" + strconv.Itoa(color.B) + "m"
}

func bg(color Color) string {
	return "\x1b[48;2;" + strconv.Itoa(color.R) + ";" + strconv.Itoa(color.G) + ";" + strconv.Itoa(color.B) + "m"
}

// Given a string, return the string with the given foreground color and or background color
func Str(text string, fgColor, bgColor *Color) string {
	var fgstr string
	if fgColor == nil {
		fgstr = ""
	} else {
		fgstr = fg(*fgColor)
	}

	var bgstr string
	if bgColor == nil {
		bgstr = ""
	} else {
		bgstr = bg(*bgColor)
	}

	return fgstr + bgstr + text + reset
}
