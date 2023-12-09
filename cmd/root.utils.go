package cmd

import (
	"autotheme/pkg/core"
	"autotheme/pkg/utils"

	lg "github.com/charmbracelet/lipgloss"
)

func printTextColors(palette core.Palette) {

	textLight := palette.TextPalette.Light
	textDark := palette.TextPalette.Dark
	harmony := palette.HarmonyPalette

	length := len(harmony)

	for i := 0; i < length; i++ {
		utils.Log.Info("\n\n palette color #%d\n\n", i+1)
		light, dark, _ := textLight[i], textDark[i], harmony[i]

		styleRoot := lg.NewStyle().Border(
			lg.RoundedBorder(),
		).Padding(0, 1).MarginTop(1)

		for k, v := range light {
			line := styleRoot.Foreground(
				lg.Color(v.Hex()),
			).BorderForeground(
				lg.Color(harmony[i][core.Dark3].Hex()),
			).Background(
				lg.Color(palette.OffWhite.Hex()),
			).BorderBackground(
				lg.Color(palette.OffWhite.Hex()),
			)
			utils.Log.Info(
				"%s",
				line.Render(string(k), v.Hex()),
			)
		}
		for k, v := range dark {
			line := styleRoot.Foreground(
				lg.Color(v.Hex()),
			).BorderForeground(
				lg.Color(harmony[i][core.Light3].Hex()),
			).Background(
				lg.Color(palette.OffBlack.Hex()),
			).BorderBackground(
				lg.Color(palette.OffBlack.Hex()),
			)
			utils.Log.Info(
				"%s",
				line.Render(string(k), v.Hex()),
			)
		}
	}
	utils.Log.Info("\n\n")
}
