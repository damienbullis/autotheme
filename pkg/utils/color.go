package utils

import (
	"autotheme/pkg/constants"
	"os"
	"strconv"

	"github.com/lucasb-eyer/go-colorful"
)

type Color struct{ R, G, B int }

var reset = "\x1b[0m"

var Str func(text string, fgColor, bgColor *colorful.Color) string

func init() {
	// Check the terminal supports 24-bit color
	if os.Getenv("COLORTERM") != "truecolor" {
		Str = func(text string, fgColor, bgColor *colorful.Color) string {
			return text
		}
	} else {
		Str = str
	}
}

func fg(color colorful.Color) string {
	return "\x1b[38;2;" + strconv.FormatFloat(color.R*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.G*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.B*255, 'f', 0, 64) + "m"
}

func bg(color colorful.Color) string {
	return "\x1b[48;2;" + strconv.FormatFloat(color.R*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.G*255, 'f', 0, 64) + ";" + strconv.FormatFloat(color.B*255, 'f', 0, 64) + "m"
}

// Create a string with optional foreground and background colors
func str(text string, fgColor, bgColor *colorful.Color) string {
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

func FgStr(color, text string) string {
	if c, ok := constants.ColorMap[color]; ok {
		return Str(text, &c, nil)
	}
	Log.Error("Color %s not supported by ColorMap", color)
	return text
}
func BgStr(color, text string) string {
	if c, ok := constants.ColorMap[color]; ok {
		return Str(text, nil, &c)
	}
	Log.Error("Color %s not supported by ColorMap", color)
	return text
}
