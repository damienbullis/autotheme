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
		cfg := config.GetConfig()

		var introStyle = lipgloss.NewStyle().Foreground(lipgloss.Color(cfg.Primary))
		utils.Log.Info(
			"\n%s %s\n\n",
			introStyle.Render("AutoTheme"),
			utils.FgStr("grey", "(v"+utils.GetVersion()+")"),
		)

		// Generate theme
		palette := core.GeneratePalette(cfg)
		logLine("Accessible colors")

		if cfg.DarkMode {
			logLine("Dark mode")
		}

		logLine("Harmonies")

		scale := core.GenerateScale(cfg)
		logLine("Scale")

		noise := ""
		if cfg.Noise {
			noise = core.GenerateNoise(cfg)
			logLine("Noise")
		}

		// core.GenerateFilters(&cfg, &palette) // TODO: finish filters

		// Write files
		core.WriteTheme(cfg, palette, scale, noise)

		if cfg.Output != "" {
			logLine(cfg.Output)
		}

		if cfg.Preview {
			core.WritePreview(cfg, palette, scale)

			utils.Log.Info(
				"\n\n%s %s %s",
				constants.IconRocket.Str(),
				"Launching preview in your browser...",
				utils.FgStr("grey", "(This may take a few seconds)"),
			)
			// core.LaunchPreview(cfg)
		} else {
			// Remove the preview if it exists
			core.RemovePreview(cfg)
		}

		if cfg.Tailwind {
			core.WriteTailwind(cfg, palette, scale, noise)
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

	// Cli only flags
	rootCmd.Flags().BoolP("silent", "s", false, "Silence all output from AutoTheme.")
	rootCmd.Flags().String("config", "", "Config file (default is ./.autotheme)")

	// Bind cli-only flags to viper
	viper.BindPFlag("config", rootCmd.Flags().Lookup("config"))
	viper.BindPFlag("silent", rootCmd.Flags().Lookup("silent"))

	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Primary color (hex) for AutoTheme to use. If not supplied, AutoTheme will pick a random color.")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use. If not supplied, AutoTheme will pick a random harmony")
	rootCmd.Flags().StringP("output", "o", "src/index.css", "Output file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file. If you pass an empty string. AutoTheme will instead print the generated CSS to standard out.")
	rootCmd.Flags().Bool("preview", false, "Generate a preview for your theme in the browser.")

	// Bind root command flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("output", rootCmd.Flags().Lookup("output"))
	viper.BindPFlag("preview", rootCmd.Flags().Lookup("preview"))

	// Non-Cli defaults
	viper.SetDefault("prefix", "at")
	viper.SetDefault("tailwind", false)

	// viper.SetDefault("useClasses", false)
	viper.SetDefault("noise", true)
	viper.SetDefault("gradients", true)
	viper.SetDefault("darkMode", true)
	viper.SetDefault("scalar", 0.0)
	viper.SetDefault("fontSize", 16.0)

	// FEATURE: Add entrypoint config option to allow for integrating with an existing index.html
	// file to inject the generated css file into the head of the document
	viper.SetDefault("entrypoint", "")

}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
