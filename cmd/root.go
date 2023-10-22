package cmd

import (
	"autotheme/pkg/config"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

// func newLn() {
// 	fmt.Printf("\n")
// }

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

	// Set Flags
	setFlags()
	// Bind Flags to Viper
	// bindFlags()

	// Set Defaults
	setDefaults()
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
