package cmd

import (
	"autotheme/pkg/interactive"
	"autotheme/pkg/utils"
	"os"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	yes bool
)

func init() {
	rootCmd.AddCommand(initCmd)
	// Init command flags
	initCmd.Flags().BoolVarP(&yes, "yes", "y", false, "Skip interactive mode and use default values")

	// Bind flags to viper
	viper.BindPFlag("yes", initCmd.Flags().Lookup("yes"))
}

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize AutoTheme configuration",
	Long:  `Generate a configuration file for AutoTheme. This will generate the file in your current working directory (CWD)`,

	Run: func(cmd *cobra.Command, args []string) {
		if yes {
			// core.WriteConfig()
			utils.Log.Error("Not implemented yet")
			os.Exit(1)
		} else {
			interactive.Prompt()
		}
	},
}
