package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"fmt"
	"os"
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
	output.WriteString(fmt.Sprintf("\nInitialize your %s config!\n\n", utils.FgStr("magenta", "AutoTheme")))
	utils.Log.Info(output.String())
	color, err := ColorPrompt()
	handleError(err)

	result, _ := colorful.Hex(color)
	outputStr := createOutputStr(result)

	output.WriteString(outputStr(color, "Primary"))
	utils.Log.Info(output.String())

	// Prompt user for harmony
	harmony, err := HarmonyPrompt()
	handleError(err)
	clearScreen()

	output.WriteString(outputStr(harmony, "Harmony"))

	utils.Log.Info(output.String())

	// Prompt user for darkmode
	// darkmode, err := DarkmodePrompt()
	// handleError(err)
	// // clearScreen()

	// output.Write([]byte(
	// 	outputStr(darkmode, "Darkmode"),
	// ))

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}

func clearScreen() {
	fmt.Print("\033[H\r\033[2J\r")
}
func clearLine() {
	fmt.Print("\033[2K\r")
}
