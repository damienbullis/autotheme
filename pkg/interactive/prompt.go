package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
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
	outputStr := createOutputStr(result)

	output.WriteString(outputStr(color, "Primary Color"))
	utils.Log.Info(output.String())

	// Prompt user for harmony
	harmony, err := HarmonyPrompt()
	handleError(err)
	output.WriteString(outputStr(harmony, "Harmony"))

	clearScreen()
	utils.Log.Info(output.String())

	// Prompt user for darkmode
	darkmode, err := DarkmodePrompt()
	handleError(err)
	output.WriteString(outputStr(strconv.FormatBool(darkmode), "Darkmode"))

	clearScreen()
	utils.Log.Info(output.String())

	// Prompt user for output
	outputPath, err := OutputPrompt()
	handleError(err)
	output.WriteString(outputStr(outputPath, "Output Path"))

	clearScreen()
	utils.Log.Info(output.String())

	// TODO: Prompt the use for Entrypoint?

	// Finally, generate config file
	// NEXT: Generate config file
	clearScreen()
	output.WriteString(
		fmt.Sprintf(
			"\n%s %s %s\n",
			"AutoTheme",
			utils.FgStr("grey", "config initialized!"),
			utils.FgStr("green", constants.IconCheck.Str()),
		),
	)
	utils.Log.Info(output.String())
}

func clearScreen() {
	fmt.Print("\033[H\r\033[2J\r")
}

// func clearLine() {
// 	fmt.Print("\033[2K\r")
// }
