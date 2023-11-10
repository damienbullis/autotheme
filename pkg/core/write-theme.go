package core

import (
	"autotheme/pkg/config"
	"fmt"
	// "fmt"
	// "strconv"
)

const TAB = "    "

func printSpacing(spacing []*Spacing) {
	fmt.Println("» Spacing:")
	fmt.Println()
	for i, space := range spacing {
		fmt.Println(TAB + fmt.Sprintf("%d", i+1) + ": " + fmt.Sprintf("%f", space.Scale))
	}
	fmt.Println()
}

func WriteTheme(palette *Palette, config *config.Config, spacing *[]*Spacing) {
	fmt.Printf("\nGenerating your " + config.Harmony + " theme...\n")

	PrintPalette(palette)
	printSpacing(*spacing)

	// Build in memory theme
	// themeLine := TAB + `--at-harmony-primary: ` + _color + ";\n"
	// rootStart := "\n:root {\n"
	// rootTheme := ""
	// rootEnd := "}\n"

	// text := palette.Text
	// offWhite := palette.OffWhite
	// offBlack := palette.OffBlack

	// // Text colors
	// rootTheme += TAB + `--at-text-primary: ` + text.LightMode.Main.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-light: ` + text.LightMode.Light.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-dark: ` + text.LightMode.Dark.Hex() + ";\n"
	// rootTheme += TAB + `--at-text-primary-neutral: ` + text.LightMode.Neutral.Hex() + ";\n"

	// harmonyPalette := palette.Harmony
	// for i, color := range harmonyPalette.Primary.Shades {
	// 	rootTheme += TAB + `--at-harmony-dark-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }
	// for i, color := range harmonyPalette.Primary.Tones {
	// 	rootTheme += TAB + `--at-harmony-neutral-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }
	// for i, color := range harmonyPalette.Primary.Tints {
	// 	rootTheme += TAB + `--at-harmony-light-` + strconv.Itoa(i) + `: ` + color.Hex() + ";\n"
	// }

	// rootTheme += TAB + `--at-primary: ` + palette.Harmony.Primary.Color.Hex() + ";\n"

	// rootTheme += TAB + `--at-white: ` + offWhite.Hex() + ";\n"
	// rootTheme += TAB + `--at-black: ` + offBlack.Hex() + ";\n"

	// fmt.Println(rootStart + rootTheme + rootEnd)
}
