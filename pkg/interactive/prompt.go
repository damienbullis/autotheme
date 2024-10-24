package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/core"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/spf13/viper"
)

func handleError(err error) {
	if err != nil {
		if err.Error() == "exit" {
			clearScreen()
			utils.Log.Info("\nExiting...\n")
			os.Exit(0)
		} else {
			utils.Log.Error("\n%s\n", err)
			os.Exit(1)
		}
	}
}

func createOutputStr(color colorful.Color) func(value, title string) string {
	return func(value, title string) string {
		return fmt.Sprintf(" %s %s %s\n",
			utils.Str(constants.IconCheck.Str(), &color, nil), title, utils.Str(value, &color, nil))
	}
}

func next(value string, out *strings.Builder, err error) {
	handleError(err)
	out.WriteString(value)
	clearScreen()
	utils.Log.Info(out.String())
}

func Prompt() {
	// Prompt user for color
	clearScreen()
	output := strings.Builder{}
	output.WriteString(
		fmt.Sprintf("\nInitializing %s...\n\n", utils.FgStr("white", "AutoTheme")))

	utils.Log.Info(output.String())
	color, err := ColorPrompt()
	handleError(err)

	result, _ := colorful.Hex(color)

	// Create output string based on the selected color
	outputStr := createOutputStr(result)

	output.WriteString(outputStr(color, "Primary Color"))
	utils.Log.Info(output.String())
	viper.Set("color", color)

	// Prompt user for harmony
	harmony, err := HarmonyPrompt()
	next(
		outputStr(harmony, "Harmony"),
		&output,
		err,
	)
	viper.Set("harmony", harmony)

	// Prompt user for darkmode
	darkmode, err := DarkmodePrompt()
	next(
		outputStr(strconv.FormatBool(darkmode), "Dark Mode"),
		&output,
		err,
	)
	viper.Set("darkmode", darkmode)
	// Prompt for tailwind
	tailwind, err := TailwindPrompt()
	next(
		outputStr(strconv.FormatBool(tailwind), "Tailwind"),
		&output,
		err,
	)
	viper.Set("tailwind", tailwind)
	// Prompt user for output
	outputPath, err := OutputPrompt()
	next(
		outputStr(outputPath, "Output"),
		&output,
		err,
	)
	viper.Set("output", outputPath)

	clearScreen()
	output.WriteString(
		fmt.Sprintf(
			"\n%s %s %s\n",
			utils.FgStr("white", "AutoTheme"),
			"config initialized!",
			constants.IconDevil.Str(),
		),
	)

	core.WriteConfig()

	utils.Log.Info(output.String())

}

func clearScreen() {
	fmt.Print("\033[H\r\033[2J\r")
}

// func clearLine() {
// 	fmt.Print("\033[2K\r")
// }
