package interactive

import "fmt"

func Prompt() {
	// Prompt user for color
	fmt.Print("Enter a color for AutoTheme to use: ")
	var color string
	_, err := fmt.Scanln(&color)
	if err != nil {
		fmt.Println("Please enter a valid hex color code (e.g. #000000 or #000)")
		return
	}

	// Prompt user for harmony
	fmt.Print("Enter a harmony for AutoTheme to use: ")
	// NEXT: Add in harmony options

	// Prompt user for output
	// NEXT: Add in output directory

	// Finally, generate config file
	// NEXT: Generate config file
}
