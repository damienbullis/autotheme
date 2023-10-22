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
	fmt.Println("Initializing Root Command...")
	cobra.OnInitialize(config.LoadConfig)

	// Root command flags
	rootCmd.Flags().StringP("color", "C", "", "Color for AutoTheme to use.\n    (default is randomly set at build time)")
	rootCmd.Flags().StringP("harmony", "H", "complementary", "Harmony for AutoTheme to use.")
	rootCmd.Flags().Float64P("scalar", "S", 1.618, "Scalar value for spacing, font sizes, etc...")
	rootCmd.Flags().StringP("outdir", "O", "dist", "Output directory to put the generated CSS file")
	rootCmd.Flags().BoolP("darkmode", "D", true, "Enable dark mode for the generated CSS file")

	fmt.Println("Root Flags Set!")

	// Bind flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
	viper.BindPFlag("harmony", rootCmd.Flags().Lookup("harmony"))
	viper.BindPFlag("scalar", rootCmd.Flags().Lookup("scalar"))
	viper.BindPFlag("outdir", rootCmd.Flags().Lookup("outdir"))
	viper.BindPFlag("darkmode", rootCmd.Flags().Lookup("darkmode"))

	fmt.Println("Root Flags Bound to Viper!")

	fmt.Println("Root Command Initialized!")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
		os.Exit(1)
	}
}
