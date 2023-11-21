package cmd

import (
	"autotheme/pkg/config"
	c "autotheme/pkg/constants"
	"autotheme/pkg/core"
	"autotheme/pkg/core/print"
	"autotheme/pkg/utils"
	"fmt"
	"os"
	"strconv"
	"time"

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

		utils.Log.Info("AutoTheme Started! (v" + utils.GetVersion() + ")")

		// Run root command here
		// utils.PrettyPrint(config)

		// Generate theme
		utils.Log.Debug("Generating theme start...")
		palette := core.GeneratePalette(config)
		scale := core.GenerateScale(config)
		noise := core.GenerateNoise(config)
		utils.Log.Debug("Generating theme end...")

		// core.GenerateFilters(&config, &palette) // TODO: finish filters

		text, harmony := print.PrintPalette(palette)
		utils.Log.Info("\n" + c.IconPalette.Str() + " " + text + "\n")
		utils.Log.Info("\n" + c.IconPalette.Str() + " " + harmony + "\n")
		utils.Log.Info(c.IconRocket.Str() + " Palette Generated! (" + strconv.FormatInt(time.Since(startTime).Milliseconds(), 10) + "ms)\n")

		print.PrintScaling(scale)
		print.PrintNoise(noise)

		// Write theme to file
		core.WriteTheme(config, palette, scale, noise)

		utils.Log.Info(c.IconCheck.Str() + " AutoTheme Finished! (" + strconv.FormatInt(time.Since(startTime).Milliseconds(), 10) + "ms)")
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
