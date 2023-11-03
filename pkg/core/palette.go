package core

import (
	"autotheme/pkg/config"
	h "autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"

	"github.com/lucasb-eyer/go-colorful"
)

type ColorType struct {
	Color  colorful.Color
	Shades []colorful.Color
	Tones  []colorful.Color
	Tints  []colorful.Color
	OffW   colorful.Color
	OffB   colorful.Color
}

// Theme is the in-memory representation of the theme
// each color is an array of colors
// representing the shades, tones, tints, and off-white/black
type Palette struct {
	Primary  ColorType
	Harmony  ColorType
	Harmony2 *ColorType
	Harmony3 *ColorType
	Harmony4 *ColorType
	Harmony5 *ColorType
}

func GeneratePalette(config *config.Config) Palette {
	// Generate the theme
	base, harmony := config.Color, config.Harmony

	// Build harmony
	// check if color was supplied
	if base == "" {
		fmt.Println("No color supplied, picking, random color...")
		base = utils.GetRandomColor()
	}
	hex, _ := colorful.Hex(base)

	// check if harmony was supplied
	if harmony == "" {
		fmt.Println("No harmony supplied, picking random harmony...")
		harmony = h.GetRandomHarmony()
	}
	fmt.Println("\nHarmony: ", harmony, "\nColor: ", hex.Hex())
	// Get the harmony function
	harmonyFn := h.GetHarmonyFn(harmony)
	var palette []ColorType

	for _, color := range harmonyFn(hex) {
		h, s, _ := color.Hsl()
		palette = append(palette, ColorType{
			Color:  color,
			Shades: utils.CalcShades(color, 3),
			Tones:  utils.CalcTones(color, 3),
			Tints:  utils.CalcTints(color, 3),
			OffW:   colorful.Hsl(h, s, 0.9667),
			OffB:   colorful.Hsl(h, s, 0.0333),
		})
	}

	// Check accessibility & modify if needed

	return *NewPalette(palette)
}

func NewPalette(palette []ColorType) *Palette {
	p := &Palette{}

	for i, color := range palette {
		switch i {
		case 0:
			p.Primary = color
		case 1:
			p.Harmony = color
		case 2:
			p.Harmony2 = &color
		case 3:
			p.Harmony3 = &color
		case 4:
			p.Harmony4 = &color
		case 5:
			p.Harmony5 = &color
		}
	}

	return p
}
