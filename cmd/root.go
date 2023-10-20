package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config theme generator using color theory",
	Long: `AutoTheme is a zero-config theme generator using color theory.
It uses the color wheel to generate a color palette based on a single color.`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("AutoTheme Starting...")
		// Run root command
		fmt.Println("AutoTheme Finished!")
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
