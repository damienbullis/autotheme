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

func logLine(primary string) {
	utils.Log.Info(
		"\n%s %s %s",
		primary,
		utils.FgStr("grey", "generated..."),
		utils.FgStr("green", constants.IconCheck.Str()),
	)
}

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
		logLine("Accessible colors")

		if config.Overrides.DarkMode {
			logLine("Dark mode")
		}

		logLine("Harmonies")

		scale := core.GenerateScale(config)
		logLine("Scale")

		noise := ""
		if config.Overrides.Noise {
			noise = core.GenerateNoise(config)
			logLine("Noise")
		}

		// core.GenerateFilters(&config, &palette) // TODO: finish filteris

		// Write files
		core.WriteTheme(config, palette, scale, noise)
		core.WriteTailwind(config, palette, scale, noise)
		logLine(config.Output)

		if config.Preview {
			core.WritePreview(config, palette, scale)

			utils.Log.Info(
				"\n\n%s %s %s",
				constants.IconRocket.Str(),
				"Launching preview in your browser...",
				utils.FgStr("grey", "(This may take a few seconds)"),
			)
			// core.LaunchPreview(config)
		}

		utils.Log.Info(
			"\n\n%s %s %s",
			constants.IconParty.Str(),
			introStyle.Render("AutoTheme has finished generating your theme!"),
			utils.FgStr("grey", fmt.Sprintf("(%dms)", time.Since(startTime).Milliseconds())),
		)

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
	viper.SetDefault("prefix", "at")
	viper.SetDefault("useClasses", true)

	viper.SetDefault("overrides.noise", true)
	viper.SetDefault("overrides.gradients", true)
	viper.SetDefault("overrides.darkMode", true)
	viper.SetDefault("overrides.scalar", 0.0)
	viper.SetDefault("overrides.fontSize", 16.0)

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
