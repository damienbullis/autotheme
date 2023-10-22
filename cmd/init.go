package cmd

import (
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
	fmt.Println("Init Flags Set & Bound to Viper!")

	fmt.Println("Init Command Initialized!")
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize AutoTheme",
	Long:  `Generated a config file for AutoTheme.`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Initializing AutoTheme...")
		// Run init command here

		fmt.Println("AutoTheme Initialized!")
	},
}
