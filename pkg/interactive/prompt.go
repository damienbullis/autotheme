package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"fmt"
	"os"

	"github.com/lucasb-eyer/go-colorful"
)

func Prompt() {
	// Prompt user for color
	clearScreen()
	utils.Log.Info("\nInitialize your %s config!\n\n", utils.FgStr("magenta", "AutoTheme"))
	color, err := ColorPrompt()
	if err != nil {
		if err.Error() == "exit" {
			clearScreen()
			utils.Log.Info("\nExiting...\n")
			os.Exit(0)
		}
		utils.Log.Error("%s\n", err)
		os.Exit(1)
	}

	result, _ := colorful.Hex(color)

	// Result
	// clearLinesAndMoveCursor(1)
	// TODO: Add in a full result of for the user to see, rather than just minimal info like this
	utils.Log.Info(utils.Str("%s %s\n", &result, nil), color, constants.IconCheck.Str())

	// Prompt user for harmony
	harmony, err := HarmonyPrompt()
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
	clearScreen()

	// TODO: replace with result
	utils.Log.Info(utils.Str("%s %s\n", &result, nil), color, constants.IconCheck.Str())
	utils.Log.Info(utils.Str("%s %s\n", &result, nil), harmony, constants.IconCheck.Str())

	// Prompt user for darkmode
	darkmode, err := DarkmodePrompt()
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
	clearScreen()

	utils.Log.Info(utils.Str("%s %s\n", &result, nil), color, constants.IconCheck.Str())
	utils.Log.Info(utils.Str("%s %s\n", &result, nil), harmony, constants.IconCheck.Str())
	utils.Log.Info(utils.Str("%s %s\n", &result, nil), darkmode, constants.IconCheck.Str())

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}

func clearScreen() {
	fmt.Print("\033[H\033[2J")
}
func clearLine() {
	fmt.Print("\033[2K\r")
}
