package cmd

import "fmt"

func setFlags() {
	fmt.Println("Setting Flags...")
	// Root command flags
	// rootCmd.Flags().StringP("config", "c", "", "The relative path to use for the config file")
	rootCmd.Flags().StringP("color", "l", "", "Color for AutoTheme to use")
	rootCmd.Flags().Float64P("scalar", "s", 0.0, "Scalar value for spacing, font sizes, etc...")
	rootCmd.Flags().StringP("outdir", "o", "", "Output directory to put the generated CSS file")
	rootCmd.Flags().BoolP("darkmode", "d", false, "Enable dark mode for the generated CSS file")

	// Init command flags
	initCmd.Flags().BoolP("interactive", "i", false, "Enable interactive mode for the init command")

	fmt.Println("Flags Set!")
}
