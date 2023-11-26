package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
)

func Prompt() {
	color, err := ColorPrompt()
	if err != nil {
		utils.Log.Error("%s\n", err)
		os.Exit(1)
	}
	clr, _ := colorful.Hex(color)
	utils.Log.Info(utils.Str("%s %s\n", &clr, nil), color, constants.IconCheck.Str())

	// Check new Harmony prompt
	harmony, err := HarmonyPrompt()
	if err != nil {
		if err.Error() == "nevermind" {
			clearScreen()
			utils.Log.Info("\nExiting...\n")
			os.Exit(0)
		} else {
			utils.Log.Error("\n%s\n", err)
			os.Exit(1)
		}
	}
	utils.Log.Info(utils.Str("%s %s\n", &clr, nil), harmony, constants.IconCheck.Str())

	// Prompt user for darkmode
	fmt.Printf(
		"%s %s ",
		"Using dark mode?",
		utils.FgStr("grey", "(y/n)"),
	)
	var darkmode string
	_, err = fmt.Scanln(&darkmode)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if darkmode != "y" && darkmode != "Y" && darkmode != "yes" && darkmode != "" {
		darkmode = "false"
	} else {
		darkmode = "true"
	}

	utils.Log.Info(
		utils.Str("%s %s\n", &clr, nil),
		strings.ToUpper(darkmode),
		constants.IconCheck.Str(),
	)

	// NEXT: Add in harmony options

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}

func clearScreen() {
	fmt.Print("\033[H\033[2J")
}
