package cmd

import (
	"autotheme/pkg/interactive"
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	rootCmd.AddCommand(initCmd)

	// Init command flags
	initCmd.Flags().BoolP("interactive", "i", false, "Enable interactive mode for the init command")

	// Bind flags to viper
	viper.BindPFlag("interactive", initCmd.Flags().Lookup("interactive"))

}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize AutoTheme",
	Long:  `Generated a config file for AutoTheme.`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Initializing AutoTheme...")
		// Run init command here

		// Check if interactive mode is enabled
		if viper.GetBool("interactive") {
			interactive.Prompt()
		} else {
			fmt.Println("Auto generating config file...")
			// NEXT: Generate config file
		}

		fmt.Println("AutoTheme Initialized!")
	},
}