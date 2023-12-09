package cmd

import (
	"autotheme/pkg/core"
	"autotheme/pkg/utils"
	"math/rand"

	lg "github.com/charmbracelet/lipgloss"
)

func getRandomNumber(min, max int) int {
	return min + rand.Intn(max-min)
}

func removeRandomeElement(arr []int) (int, []int) {
	index := getRandomNumber(0, len(arr))
	el := arr[index]
	return el, append(arr[:index], arr[index+1:]...)
}

func printTextColors(palette core.Palette) {

	textLight := palette.TextPalette.Light
	textDark := palette.TextPalette.Dark
	harmony := palette.HarmonyPalette

	length := len(harmony)
	// how can I map over the harmony array and create a new array of the indexes instead of the values?
	used := make([]int, length)
	for i := range used {
		used[i] = i
	}

	for k := 0; k < length; k++ {
		i, mapped := removeRandomeElement(used)
		used = mapped
		utils.Log.Info("\n\n\n palette color #%d\n", k+1)
		light, dark, harm := textLight[k], textDark[k], harmony[i]

		styleRoot := lg.NewStyle().Border(
			lg.RoundedBorder(),
		).Padding(0, 1).MarginTop(1)

		for k, v := range light {
			line := styleRoot.Foreground(
				lg.Color(v.Hex()),
			).BorderForeground(
				lg.Color(harm[core.Dark5].Hex()),
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
				lg.Color(harm[core.Light5].Hex()),
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
