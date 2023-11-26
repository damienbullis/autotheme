package interactive

import (
	"autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"
	"os"

	"github.com/lucasb-eyer/go-colorful"
)

func Prompt() {
	// Prompt user for color
	fmt.Printf(
		"\n%s %s ",
		"Please enter a color:",
		utils.FgStr("grey", "(or enter to use a random color)"),
	)
	var color string
	_, err := fmt.Scanln(&color)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if color == "" {
		fmt.Print(utils.FgStr("grey", "...thinking..."))
		color = utils.GetRandomColor()
		cstr, err := colorful.Hex(color)
		if err != nil {
			utils.Log.Error("Error converting color to hex: %s", err)
			os.Exit(1)
		}
		// Prompt user to confirm random color
		fmt.Printf(
			"\nUse %s as your color? %s ",
			utils.Str(color, &cstr, nil),
			utils.FgStr("grey", "(y/n)"),
		)

		var confirm string
		_, err = fmt.Scanln(&confirm)
		if err != nil && err.Error() != "unexpected newline" {
			utils.Log.Error("Error reading input: %s", err)
			os.Exit(1)
		}
		if confirm != "y" && confirm != "Y" && confirm != "yes" && confirm != "" {
			os.Exit(0)
		}
	} else if config.CheckColorFlag(color) != nil {
		utils.Log.Error("Invalid color provided")
		os.Exit(1)
	}

	// Prompt user for harmony
	fmt.Printf(
		"%s %s ",
		"Please enter a harmony:",
		utils.FgStr("grey", "(or enter to use a random harmony)"),
	)

	var harmonyInput string
	_, err = fmt.Scanln(&harmonyInput)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if harmonyInput == "" {
		harmonyInput = harmony.GetRandomHarmony()
		fmt.Printf(utils.FgStr("grey", "\r...how about %s..."), harmonyInput)
	} else if config.CheckHarmonyFlag(harmonyInput) != nil {
		utils.Log.Error("Invalid harmony provided")
		os.Exit(1)
	}

	// Confirm harmony
	fmt.Printf("\nUse %s as your harmony? %s ", harmonyInput, utils.FgStr("grey", "(y/n)"))
	var confirm string
	_, err = fmt.Scanln(&confirm)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}

	if confirm != "y" && confirm != "Y" && confirm != "yes" && confirm != "" {
		os.Exit(0)
	}
	fmt.Printf("%s\n", utils.FgStr("green", constants.IconCheck.Str()))

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
	fmt.Printf("%s\n", utils.FgStr("green", constants.IconCheck.Str()))

	//

	// NEXT: Add in harmony options

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}
