package cmd

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core"
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

		palette := core.GeneratePalette(&config)
		// spacing := core.GenerateSpacing(&config)
		// text := core.GenerateText(&config)
		// gradients := core.GenerateGradients(&config)
		// shadows := core.GenerateShadows(&config)
		// borders := core.GenerateBorders(&config)
		// darkmode := core.GenerateDarkmode(&config)

		// Write theme to file
		// NEXT: add rest of the options into the WriteTheme function
		core.WriteTheme(&palette, &config)

		fmt.Println("\nAutoTheme Finished! (" + strconv.FormatInt(time.Since(startTime).Milliseconds(), 10) + "ms)")
	},
}

func init() {
	cobra.OnInitialize(config.LoadConfig)

	// Root command flags
	rootCmd.Flags().StringP("config", "c", "", "Config file (default is ./.autotheme)")
	rootCmd.Flags().StringP("primary", "p", "", "Primary color (hex) for AutoTheme to use.\n   (default is randomly set at build time)")
	rootCmd.Flags().StringP("harmony", "a", "", "Harmony for AutoTheme to use.")
	rootCmd.Flags().StringP("outdir", "o", "dist", "Output directory (default is dist)")

	// Bind flags to viper
	viper.BindPFlag("config", rootCmd.Flags().Lookup("config"))
	viper.BindPFlag("primary", rootCmd.Flags().Lookup("primary"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("outdir", rootCmd.Flags().Lookup("outdir"))
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
