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

// Create a string with optional foreground and background colors
func Str(text string, fgColor, bgColor *Color) string {
	fgstr := ""
	if fgColor != nil {
		fgstr = fg(*fgColor)
	}

	bgstr := ""
	if bgColor != nil {
		bgstr = bg(*bgColor)
	}

	return fgstr + bgstr + text + reset
}

// TODO: Implement this
func GetRandomColor() string {
	return "#000000"
}
