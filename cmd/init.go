package cmd

import (
	"autotheme/pkg/core"
	"autotheme/pkg/interactive"
	"os"
	"strings"

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
			// Since the output flag by default is index.css, we need to replace it with autotheme.yml
			outputPath := strings.Replace(viper.GetString("output"), "index.css", "autotheme.yml", 1)

			core.WriteConfig(outputPath)
			os.Exit(1)
		} else {
			interactive.Prompt()
		}
	},
}
