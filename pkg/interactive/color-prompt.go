package interactive

import (
	"autotheme/pkg/config"
	"autotheme/pkg/utils"
	"fmt"
	"os"

	"github.com/lucasb-eyer/go-colorful"
)

func ColorPrompt() (string, error) {

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
		return "", err
	}

	if color == "" {
		// if color is empty, get a random color
		return getColor()

	} else if config.CheckColorFlag(color) != nil {
		// if color is not valid, prompt again
		return ColorPrompt()
	}
	return color, nil
}

func getColor() (string, error) {
	color := utils.GetRandomColor()
	cstr, _ := colorful.Hex(color)

	// Prompt user to confirm random color
	utils.Log.Info(
		"Use %s? %s ",
		utils.Str(color, &cstr, nil),
		utils.FgStr("grey", "(y/n)"),
	)
	var confirm string

	_, err := fmt.Scanln(&confirm)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if confirm == "y" || confirm == "Y" || confirm == "yes" || confirm == "" {
		return color, nil
	}
	if confirm == "n" || confirm == "N" || confirm == "no" {
		return getColor()
	}
	return "", nil
}
