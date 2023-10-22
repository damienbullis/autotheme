package cmd

import (
	"autotheme/pkg/config"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

func newLn() {
	fmt.Printf("\n")
}

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config CSS theme generator",
	Long:  `AutoTheme is a zero-config theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("AutoTheme Starting...")
		// Run root command here

		fmt.Println("AutoTheme Finished!")
	},
}

func init() {
	fmt.Println("Initializing AutoTheme...")
	cobra.OnInitialize(config.LoadConfig)
	setFlags()
}

func setFlags() {
	rootCmd.Flags().StringP("config", "c", "", "The relative path to use for the config file")
	rootCmd.Flags().StringP("color", "l", "", "Color for AutoTheme to use")
	rootCmd.Flags().Float64P("scalar", "s", 0.0, "Scalar value for spacing, font sizes, etc...")
	rootCmd.Flags().StringP("outdir", "o", "", "Output directory to put the generated CSS file")
	rootCmd.Flags().BoolP("darkmode", "d", false, "Enable dark mode for the generated CSS file")

}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
