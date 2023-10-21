package utils

import (
	"strconv"
)

type Color struct{ R, G, B int }

var reset = "\x1b[0m"

func fg(r, g, b int) string {
	return "\x1b[38;2;" + strconv.Itoa(r) + ";" + strconv.Itoa(g) + ";" + strconv.Itoa(b) + "m"
}

func bg(r, g, b int) string {
	return "\x1b[48;2;" + strconv.Itoa(r) + ";" + strconv.Itoa(g) + ";" + strconv.Itoa(b) + "m"
}

// Give a string, return the string with the given foreground color and or background color
func Clr(text string, fgColor, bgColor *Color) string {
	var fgstr string
	if fgColor == nil {
		fgstr = ""
	} else {
		fgstr = fg(fgColor.R, fgColor.G, fgColor.B)
	}

	var bgstr string
	if bgColor == nil {
		bgstr = ""
	} else {
		bgstr = bg(bgColor.R, bgColor.G, bgColor.B)
	}

	return fgstr + bgstr + text + reset
}
