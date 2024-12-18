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
	Long:    `AutoTheme is a zero-config zero-dependency theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,
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
			utils.FgStr("grey", "("+cmd.Version+")"),
		)

		// Generate theme
		palette := core.GeneratePalette(*cfg)
		logLine("Accessible colors")

		if cfg.DarkMode {
			logLine("Dark mode")
		}

		logLine("Harmonies")

		scale := core.GenerateScale(*cfg)
		logLine("Scale")

		noise := ""
		if cfg.Noise {
			noise = core.GenerateNoise(*cfg)
			logLine("Noise")
		}

		// core.GenerateFilters(&cfg, &palette) // TODO: finish filters

		// Write files
		core.WriteTheme(*cfg, palette, scale, noise)

		if cfg.Output != "" {
			logLine(cfg.Output)
		}

		if cfg.Preview {
			core.WritePreview(*cfg, palette, scale)

			utils.Log.Info(
				"\n\n%s %s %s",
				constants.IconRocket.Str(),
				"Launching preview in your browser...",
				utils.FgStr("grey", "(This may take a few seconds)"),
			)
			// core.LaunchPreview(cfg)
		} else {
			// Remove the preview if it exists
			core.RemovePreview(*cfg)
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
	rootCmd.SetVersionTemplate("AutoTheme {{.Version}}\n")
	rootCmd.Flags().BoolP("silent", "s", false, "Silence all output from AutoTheme.")
	rootCmd.PersistentFlags().String("config", "", "Config file (default is ./autotheme.*)")

	// Bind cli-only flags to viper
	viper.BindPFlag("config", rootCmd.PersistentFlags().Lookup("config"))
	viper.BindPFlag("silent", rootCmd.Flags().Lookup("silent"))

	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Primary color (hex) for AutoTheme to use. If not supplied, AutoTheme will pick a random color.")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use. If not supplied, AutoTheme will pick a random harmony")
	rootCmd.PersistentFlags().StringP("output", "o", "src/autotheme.css", "Output file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file. If you pass an empty string. AutoTheme will instead print the generated CSS to standard out.")
	rootCmd.Flags().Bool("tailwind", false, "Integrate AutoTheme into your tailwind.config file.")
	rootCmd.Flags().Bool("preview", false, "Generate a preview for your theme in the browser.")

	// Bind root command flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("output", rootCmd.PersistentFlags().Lookup("output"))
	viper.BindPFlag("tailwind", rootCmd.Flags().Lookup("tailwind"))
	viper.BindPFlag("preview", rootCmd.Flags().Lookup("preview"))

	// // Non-Cli defaults
	// viper.SetDefault("prefix", nil)
	// viper.SetDefault("noise", nil)
	// viper.SetDefault("spacing", nil)
	// viper.SetDefault("gradients", nil)
	// viper.SetDefault("dark-mode", nil)
	// viper.SetDefault("scalar", nil)
	// viper.SetDefault("font-size", nil)

	// // TODO: finish these
	// viper.SetDefault("entrypoint", nil)    // html or css
	// viper.SetDefault("use-harmonies", nil) // []string{}
}

func Execute(version string) {
	// Assign the version to the root command
	rootCmd.Version = version

	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
