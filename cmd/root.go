package cmd

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core"
	"autotheme/pkg/core/harmony"
	c "autotheme/pkg/utils"
	"fmt"
	"os"
	"time"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const TAB = "    "

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
		fmt.Println("AutoTheme Starting...")
		// Run root command here

		_color := viper.GetString("color")
		if _color == "" {
			fmt.Println("No color provided... picking a random color!")
			_color = c.GetRandomColor()
		}

		// Build in memory theme
		// themeLine := TAB + `--at-harmony-primary: ` + _color + ";\n"
		rootStart := "\n:root {\n"
		rootTheme := ""
		rootEnd := "}\n"

		config := config.GetConfig()

		palette := core.GeneratePalette(&config)
		fmt.Println(palette)

		hex, _ := colorful.Hex(_color)

		// Build harmony
		colors := harmony.TriadicHarmony(hex)

		c.PreviewTheme(colors)

		// NEXT: Write theme to file
		// writeTheme(theme)

		fmt.Println("\nAutoTheme Finished!\n", rootStart+rootTheme+rootEnd)
	},
}

var StartTime time.Time

func init() {
	StartTime = time.Now() // For timing the build
	cobra.OnInitialize(config.LoadConfig)

	// REFACTOR: Do we want to support flags for each value in the config file?
	// Root command flags
	rootCmd.Flags().StringP("config", "c", "", "Config file (default is ./.autotheme)")
	rootCmd.Flags().StringP("primary", "p", "", "Primary hex color for AutoTheme to use.\n   (default is randomly set at build time)")
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
