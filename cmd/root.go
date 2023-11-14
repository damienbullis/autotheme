package cmd

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core"
	"autotheme/pkg/core/print"
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
		fmt.Println("AutoTheme Starting...")
		// Run root command here
		config := config.GetConfig()

		palette := core.GeneratePalette(config)
		scale := core.GenerateScale(config)
		noise := core.GenerateNoise(config)
		gradients := core.GenerateGradients(config, palette)

		// core.GenerateFilters(&config, &palette) // TODO: finish filters

		print.PrintPalette(palette)
		print.PrintScaling(scale)
		print.PrintNoise(noise)
		print.PrintGradients(gradients)

		// Write theme to file
		core.WriteTheme(config, palette, scale, noise, gradients)

		fmt.Println("\nAutoTheme Finished! (" + strconv.FormatInt(time.Since(startTime).Milliseconds(), 10) + "ms)")
	},
}

func init() {
	cobra.OnInitialize(config.LoadConfig)

	// Root command flags
	rootCmd.Flags().StringP("config", "c", "", "Config file (default is ./.autotheme)")
	rootCmd.Flags().StringP("primary", "p", "", "Primary color (hex) for AutoTheme to use. If not supplied, AutoTheme will pick a random color.")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use. If not supplied, AutoTheme will pick a random harmony")
	rootCmd.Flags().StringP("output", "o", "src/index.css", "Output file for AutoTheme to use. This will create the file if it doesn't exist or update an existing file.")
	rootCmd.Flags().BoolP("visualize", "v", false, "Generate a interactive preview of the theme.")

	// Bind flags to viper
	viper.BindPFlag("config", rootCmd.Flags().Lookup("config"))
	viper.BindPFlag("primary", rootCmd.Flags().Lookup("primary"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("output", rootCmd.Flags().Lookup("output"))
	viper.BindPFlag("visualize", rootCmd.Flags().Lookup("visualize"))

	// Utility options
	viper.SetDefault("noise", true)
	viper.SetDefault("filters", true)
	viper.SetDefault("gradients", true)
	viper.SetDefault("darkmode", true)
	viper.SetDefault("prefix", "at")
	viper.SetDefault("scalar", nil)

	viper.SetDefault("entrypoint", nil)
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
