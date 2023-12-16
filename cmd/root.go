package cmd

import (
	"autotheme/pkg/config"
	"autotheme/pkg/constants"
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
		if viper.IsSet("color") && viper.GetString("color") != "" {
			if err := config.CheckColorFlag(viper.GetString("color")); err != nil {
				return err
			}
		}
		if viper.IsSet("harmony") && viper.GetString("harmony") != "" {
			if err := config.CheckHarmonyFlag(viper.GetString("harmony")); err != nil {
				return err
			}
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
		palette := core.GeneratePalette(config)

		utils.Log.Info(
			"\n%s %s %s",
			"Accessible colors",
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", constants.IconCheck.Str()),
		)

		if config.Darkmode {
			utils.Log.Info(
				"\n%s %s %s",
				"Dark mode",
				utils.FgStr("grey", "generated..."),
				utils.FgStr("green", constants.IconCheck.Str()),
			)
		}

		utils.Log.Info(
			"\n%s %s %s",
			"Harmonies",
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", constants.IconCheck.Str()),
		)

		scale := core.GenerateScale(config)
		utils.Log.Info(
			"\n%s %s %s",
			"Scale",
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", constants.IconCheck.Str()),
		)

		noise := core.GenerateNoise(config)
		if config.Noise {
			utils.Log.Info(
				"\n%s %s %s",
				"Noise",
				utils.FgStr("grey", "generated..."),
				utils.FgStr("green", constants.IconCheck.Str()),
			)
		}

		// core.GenerateFilters(&config, &palette) // TODO: finish filters

		// Write theme to file
		core.WriteTheme(config, palette, scale, noise)

		// Write tailwind config
		// TODO: Add if config.tailwind
		core.WriteTailwind(config, palette, scale, noise)

		utils.Log.Info(
			"\n'%s' %s %s",
			config.Output,
			utils.FgStr("grey", "generated..."),
			utils.FgStr("green", constants.IconCheck.Str()),
		)

		utils.Log.Info(
			"\n\n%s %s %s",
			constants.IconParty.Str(),
			introStyle.Render("AutoTheme has finished generating your theme!"),
			utils.FgStr("grey", fmt.Sprintf("(%dms)", time.Since(startTime).Milliseconds())),
		)

		if config.Preview {
			utils.Log.Info(
				"\n\n%s %s %s",
				constants.IconRocket.Str(),
				"Launching preview in your browser...",
				utils.FgStr("grey", "(This may take a few seconds)"),
			)
			// core.LaunchPreview(config)
		}
		utils.Log.Info("\n") // End with a newline
	},
}

func init() {

	cobra.OnInitialize(config.LoadConfig)

	// CLI ONLY
	rootCmd.Flags().BoolP("silent", "s", false, "Silence all output from AutoTheme.")
	rootCmd.Flags().String("config", "", "Config file (default is ./.autotheme)")

	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Primary color (hex) for AutoTheme to use. If not supplied, AutoTheme will pick a random color.")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use. If not supplied, AutoTheme will pick a random harmony")
	rootCmd.Flags().StringP("output", "o", "src/index.css", "Output file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file.")
	rootCmd.Flags().Bool("preview", false, "Generate a preview for your theme in the browser.")

	// Bind cli-only flags to viper
	viper.BindPFlag("config", rootCmd.Flags().Lookup("config"))
	viper.BindPFlag("silent", rootCmd.Flags().Lookup("silent"))

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
	viper.SetDefault("use-classes", true)

	// ??? Not sure
	// viper.SetDefault("entrypoint", "")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
