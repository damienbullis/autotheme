package utils

import (
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

type Color struct{ R, G, B int }

var reset = "\x1b[0m"

func fg(color colorful.Color) string {
	return "\x1b[38;2;" + strconv.FormatFloat(color.R*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.G*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.B*255, 'f', 0, 64) + "m"
}

func bg(color colorful.Color) string {
	return "\x1b[48;2;" + strconv.FormatFloat(color.R*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.G*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.B*255, 'f', 0, 64) + "m"
}

// Create a string with optional foreground and background colors
func Str(text string, fgColor, bgColor *colorful.Color) string {
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

func GetRandomColor() string {
	return colorful.FastHappyColor().Hex()
}
