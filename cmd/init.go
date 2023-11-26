package cmd

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/interactive"
	"autotheme/pkg/utils"

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
		utils.Log.Info(
			utils.FgStr("grey", "\nInitializing AutoTheme (v%s)...\n"),
			utils.GetVersion(),
		)

		if yes {
			// core.WriteConfig()
		} else {
			interactive.Prompt()
		}

		utils.Log.Info(
			"\n%s %s\n",
			"Your AutoTheme configuration has been generated.",
			utils.FgStr("green", constants.IconCheck.Str()),
		)
	},
}
