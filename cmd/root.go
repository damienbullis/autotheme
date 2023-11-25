package cmd

import (
	"autotheme/pkg/config"
	c "autotheme/pkg/constants"
	"autotheme/pkg/core"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:     "autotheme",
	Short:   "A zero-config CSS theme generator",
	Long:    `AutoTheme is a zero-config theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,
	Aliases: []string{"auto"},
	Args: func(cmd *cobra.Command, args []string) error {
		if err := config.CheckColorFlag(); err != nil {
			return err
		} else if err := config.CheckHarmonyFlag(); err != nil {
			return err
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		startTime := time.Now()
		config := config.GetConfig()

		var introStyle = lipgloss.NewStyle().Foreground(lipgloss.Color(config.Primary))
		utils.Log.Info(
			"\n%s %s\n\n",
			introStyle.Render("AutoTheme"),
			utils.FgStr("grey", "(v"+utils.GetVersion()+")"),
		)

		// Generate theme
		utils.Log.Debug("[ %s ] Generating theme...", c.StageBuild)
		palette := core.GeneratePalette(config)

		utils.Log.Info(
			"%s %s %s",
			"Light",
			utils.FgStr("grey", "mode colors generated..."),
			utils.FgStr("green", c.IconCheck.Str()),
		)
		utils.Log.Debug("[ %s ] Light mode colors:\n%+v\n", c.StageBuild, palette.Light)

		if config.Darkmode {
			utils.Log.Info(
				"%s %s %s",
				"Dark",
				utils.FgStr("grey", "mode colors generated..."),
				utils.FgStr("green", c.IconCheck.Str()),
			)
			utils.Log.Debug("[ %s ] Dark mode colors:\n%+v\n", c.StageBuild, palette.Dark)
		}

		utils.Log.Info(
			"%s %s %s",
			"Harmony",
			utils.FgStr("grey", "colors generated..."),
			utils.FgStr("green", c.IconCheck.Str()),
		)
		utils.Log.Debug("[ %s ] Harmony colors:\n%+v\n", c.StageBuild, palette.Harmony)

		scale := core.GenerateScale(config)
		utils.Log.Info(
			"%s %s %s",
			"Scale",
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", c.IconCheck.Str()),
		)
		utils.Log.Debug("[ %s ] Scale:\n%+v\n", c.StageBuild, scale)

		noise := core.GenerateNoise(config)
		utils.Log.Info(
			"%s %s %s",
			"Noise",
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", c.IconCheck.Str()),
		)
		utils.Log.Debug("[ %s ] Noise:\n%+v\n", c.StageBuild, noise)

		// core.GenerateFilters(&config, &palette) // TODO: finish filters

		// Write theme to file
		core.WriteTheme(config, palette, scale, noise)

		utils.Log.Info(
			"\n%s %s %s",
			c.IconParty.Str(),
			introStyle.Render("AutoTheme has finished generating your theme!"),
			utils.FgStr("grey", fmt.Sprintf("(%dms)", time.Since(startTime).Milliseconds())),
		)
		utils.Log.Debug(
			"[ %s ] AutoTheme has finished generating your theme! (%dms)",
			c.StageDone,
			time.Since(startTime).Milliseconds(),
		)

	},
}

func init() {
	cobra.OnInitialize(config.LoadConfig)

	// CLI ONLY
	rootCmd.Flags().BoolP("silent", "s", false, "Silence all output from AutoTheme.")
	rootCmd.Flags().String("config", "", "Config file (default is ./.autotheme)")
	rootCmd.Flags().String("log-file", "", "Log file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file.")

	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Primary color (hex) for AutoTheme to use. If not supplied, AutoTheme will pick a random color.")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use. If not supplied, AutoTheme will pick a random harmony")
	rootCmd.Flags().StringP("output", "o", "src/index.css", "Output file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file.")
	rootCmd.Flags().Bool("preview", false, "Generate a preview for your theme in the browser.")

	// Bind cli-only flags to viper
	viper.BindPFlag("config", rootCmd.Flags().Lookup("config"))
	viper.BindPFlag("silent", rootCmd.Flags().Lookup("silent"))
	viper.BindPFlag("log-file", rootCmd.Flags().Lookup("log-file"))

	// Bind root command flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("output", rootCmd.Flags().Lookup("output"))
	viper.BindPFlag("preview", rootCmd.Flags().Lookup("preview"))

	// Non-Cli defaults
	viper.SetDefault("noise", true)
	viper.SetDefault("filters", true)
	viper.SetDefault("gradients", true)
	viper.SetDefault("darkmode", true)
	viper.SetDefault("prefix", "at")
	viper.SetDefault("scalar", 0.0)
	viper.SetDefault("fontsize", 16.0)

	// ??? Not sure
	viper.SetDefault("entrypoint", "")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
