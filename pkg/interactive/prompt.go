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
	outputStr := createOutputStr(result)

	output.WriteString(outputStr(color, "Primary Color"))
	utils.Log.Info(output.String())

	// Prompt user for harmony
	harmony, err := HarmonyPrompt()
	next(
		outputStr(harmony, "Harmony"),
		&output,
		err,
	)

	// Prompt user for darkmode
	darkmode, err := DarkmodePrompt()
	next(
		outputStr(strconv.FormatBool(darkmode), "Darkmode"),
		&output,
		err,
	)
	// Prompt for tailwind
	tailwind, err := TailwindPrompt()
	next(
		outputStr(strconv.FormatBool(tailwind), "Tailwind"),
		&output,
		err,
	)
	// Prompt user for output
	outputPath, err := OutputPrompt()
	next(
		outputStr(outputPath, "Output"),
		&output,
		err,
	)

	clearScreen()

	utils.Log.Error("Tailwind: NOT IMPLEMENTED YET")
	utils.Log.Error("WriteConfig: NOT IMPLEMENTED YET")
	// Finally, generate config file
	// NEXT: Generate config file
	output.WriteString(
		fmt.Sprintf(
			"\n%s %s %s\n",
			utils.FgStr("white", "AutoTheme"),
			"config initialized!",
			constants.IconDevil.Str(),
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
