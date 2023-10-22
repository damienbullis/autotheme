package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

func init() {
	rootCmd.AddCommand(initCmd)
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize AutoTheme",
	Long:  `Initialize AutoTheme by creating a config file and a theme file`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Initializing Start...")
		// Run init command here

		fmt.Println("Initializing End!")
	},
}
