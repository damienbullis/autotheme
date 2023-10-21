package cmd

import (
	"autotheme/pkg/utils"
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

type Config struct {
	config   string
	color    string
	scalar   float64
	outdir   string
	darkmode bool
	// TODO: Add more config options
}

var cfg Config

func clrLn() {
	fmt.Printf("\n")
}

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config CSS theme generator",
	Long:  `AutoTheme is a zero-config theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("AutoTheme Starting...")
		// Run root command

		fgColor := utils.Color{R: 255, G: 0, B: 0}

		fmt.Printf(utils.Clr("Config: %s", &fgColor, nil), cfg.config)
		clrLn()
		fmt.Printf("Color: %s\n", cfg.color)
		fmt.Printf("Outdir: %s\n", cfg.outdir)
		fmt.Printf("Darkmode: %t\n", cfg.darkmode)
		fmt.Printf("Scalar: %f\n", cfg.scalar)

		fmt.Println("AutoTheme Finished!")
	},
}

func init() {
	// Add flags here
	rootCmd.PersistentFlags().StringVarP(&cfg.config, "config", "c", "", "The relative path to use for the config file")
	rootCmd.PersistentFlags().StringVarP(&cfg.color, "color", "l", "", "Color for AutoTheme to use")
	rootCmd.PersistentFlags().Float64VarP(&cfg.scalar, "scalar", "s", 0.0, "Scalar value for spacing, font sizes, etc...")
	rootCmd.PersistentFlags().StringVarP(&cfg.outdir, "outdir", "o", "", "Output directory to put the generated CSS file")
	rootCmd.PersistentFlags().BoolVarP(&cfg.darkmode, "darkmode", "d", false, "Enable dark mode for the generated CSS file")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
