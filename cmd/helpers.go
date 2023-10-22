package cmd

import (
	"fmt"

	"github.com/spf13/viper"
)

func setFlags() {
	fmt.Println("Setting Flags...")
	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Color for AutoTheme to use")
	rootCmd.Flags().Float64P("scalar", "s", 0.0, "Scalar value for spacing, font sizes, etc...")
	rootCmd.Flags().StringP("outdir", "o", "", "Output directory to put the generated CSS file")
	rootCmd.Flags().BoolP("darkmode", "d", false, "Enable dark mode for the generated CSS file")

	// Init command flags
	initCmd.Flags().BoolP("interactive", "i", false, "Enable interactive mode for the init command")

	fmt.Println("Flags Set!")
}

// func bindFlags() {}

func setDefaults() {
	viper.SetDefault("color", "#000333")
	viper.SetDefault("scalar", 1.618)
	viper.SetDefault("outdir", "./")
	viper.SetDefault("darkmode", true)
}
