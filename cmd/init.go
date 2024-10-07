package cmd

import (
	"autotheme/pkg/core"
	"autotheme/pkg/interactive"
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
			core.WriteConfig()
			os.Exit(1)
		} else {
			interactive.Prompt()
		}
	},
}
