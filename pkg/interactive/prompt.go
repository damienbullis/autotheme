package interactive

import (
	"autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
)

func Prompt() {
	// Prompt user for color
	utils.Log.Info(
		"%s %s ",
		"Please enter a color:",
		utils.FgStr("grey", "(or enter to use a random color)"),
	)
	var color string

	// Read answer
	_, err := fmt.Scanln(&color)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}

	if color == "" {
		color, err = PromptColor()
		if err != nil {
			utils.Log.Error("Error prompting for color: %s", err)
			os.Exit(1)
		}
	} else if config.CheckColorFlag(color) != nil {
		utils.Log.Error("Invalid color provided")
		os.Exit(1)
	}
	clr, _ := colorful.Hex(color)
	utils.Log.Info(utils.Str("%s %s\n", &clr, nil), color, constants.IconCheck.Str())

	// Prompt user for harmony
	harmony, err := PromptHarmony()
	if err != nil {
		utils.Log.Error("Error prompting for harmony: %s", err)
		os.Exit(1)
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

	//

	// NEXT: Add in harmony options

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}

func PromptColor() (string, error) {
	color := utils.GetRandomColor()
	cstr, err := colorful.Hex(color)
	if err != nil {
		utils.Log.Error("Error converting color to hex: %s", err)
		os.Exit(1)
	}

	// Prompt user to confirm random color
	utils.Log.Info(
		"Use %s as your color? %s ",
		utils.Str(color, &cstr, nil),
		utils.FgStr("grey", "(y/n)"),
	)
	var confirm string

	_, err = fmt.Scanln(&confirm)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if confirm == "y" || confirm == "Y" || confirm == "yes" || confirm == "" {
		return color, nil
	}
	if confirm == "n" || confirm == "N" || confirm == "no" {
		return PromptColor()
	}
	return "", nil
}

func PromptHarmony() (string, error) {
	utils.Log.Info(
		"%s %s ",
		"Please enter a harmony:",
		utils.FgStr("grey", "(or enter to use a random harmony)"),
	)

	var harmonyInput string
	_, err := fmt.Scanln(&harmonyInput)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if harmonyInput == "" {
		harmonyInput = harmony.GetRandomHarmony()
	} else if config.CheckHarmonyFlag(harmonyInput) != nil {
		utils.Log.Error("Invalid harmony provided")
		os.Exit(1)
	}

	// Confirm harmony
	utils.Log.Info("Use %s as your harmony? %s ", harmonyInput, utils.FgStr("grey", "(y/n)"))
	var confirm string
	_, err = fmt.Scanln(&confirm)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}

	if confirm == "y" || confirm == "Y" || confirm == "yes" || confirm == "" {
		return harmonyInput, nil
	}
	if confirm == "n" || confirm == "N" || confirm == "no" {
		return PromptHarmony()
	}
	return "", nil
}
