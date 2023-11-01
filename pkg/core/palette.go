package core

import (
	"autotheme/pkg/config"

	"github.com/lucasb-eyer/go-colorful"
)

type ColorType struct {
	color  colorful.Color
	shades []colorful.Color
	tones  []colorful.Color
	tints  []colorful.Color
	offW   colorful.Color
	offB   colorful.Color
}

// Theme is the in-memory representation of the theme
// each color is an array of colors
// representing the shades, tones, tints, and off-white/black
type Theme struct {
	Primary  ColorType
	Harmony  ColorType
	Harmony2 *ColorType
	Harmony3 *ColorType
	Harmony4 *ColorType
	Harmony5 *ColorType
}

func GeneratePalette(config *config.Config) Theme {
	// Generate the theme
	// base, harmony := config.Color, config.Harmony
	// hex, _ := colorful.Hex(base)

	return Theme{}
}
