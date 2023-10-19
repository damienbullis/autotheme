package main

import (
	"fmt"

	"autotheme/cmd"
)

func main() {
	fmt.Println("Autotheme Starting...")

	// Run root command
	cmd.Execute()

	// // Generate the theme
	// theme := core.generateTheme(cfg)

	// // Write the theme to the file
	// core.writeTheme(theme, cfg)

	fmt.Println("Autotheme Finished!")
}
