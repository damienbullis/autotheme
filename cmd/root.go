package cmd

import (
	"autotheme/pkg/config"
	"errors"
	"fmt"
	"os"
	"unicode/utf8"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// func newLn() {
// 	fmt.Printf("\n")
// }

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config CSS theme generator",
	Long:  `AutoTheme is a zero-config theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,

	Args: func(cmd *cobra.Command, args []string) error {
		// check color flag
		if viper.GetString("color") != "" {
			// check if color flag is valid
			// check with regex for hex code
			clr := viper.GetString("color")
			len := utf8.RuneCountInString(clr)
			if (len != 7 && len != 4) || clr[0] != '#' {
				return errors.New("color flag is invalid, please provide a valid hex code (e.g. #000000 or #000)")
			}
		}

		// check harmony flag
		if viper.GetString("harmony") != "" {
			// check if harmony flag is valid
			if viper.GetString("harmony") != "complementary" &&
				viper.GetString("harmony") != "analogous" &&
				viper.GetString("harmony") != "triadic" &&
				viper.GetString("harmony") != "split-complementary" &&
				viper.GetString("harmony") != "rectangle" &&
				viper.GetString("harmony") != "" {
				return errors.New("harmony flag is invalid")
			}
		}

		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("AutoTheme Starting...")
		// Run root command here

		fmt.Println("AutoTheme Finished!")
	},
}

func init() {
	fmt.Println("Root Command:")
	cobra.OnInitialize(config.LoadConfig)

	// NEXT: Do we want to support flags for each value in the config file?

	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Color for AutoTheme to use.\n    (default is randomly set at build time)")
	rootCmd.Flags().StringP("harmony", "a", "complementary", "Harmony for AutoTheme to use.")
	rootCmd.Flags().StringP("outdir", "o", "dist", "Output directory relative to current working directory for the generated CSS file")

	// Bind flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("outdir", rootCmd.Flags().Lookup("outdir"))

	fmt.Println("Root Flags Set & Bound to Viper!")

	fmt.Println("Root Command Initialized!")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
