package cmd

import (
	"autotheme/pkg/config"
	"autotheme/pkg/core/harmony"
	c "autotheme/pkg/utils"
	"errors"
	"fmt"
	"os"
	"strconv"
	"unicode/utf8"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const TAB = "    "

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config CSS theme generator",
	Long:  `AutoTheme is a zero-config theme generator using color theory, sensible options & defaults, and modern HTML and CSS features.`,

	Args: func(cmd *cobra.Command, args []string) error {
		// REFACTOR: Move this to a separate function
		// check color flag
		if viper.GetString("color") != "" {
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

		_color := viper.GetString("color")
		if _color == "" {
			fmt.Println("No color provided... picking a random color!")
			_color = c.GetRandomColor()
		}

		// Build in memory theme
		theme := "\n:root {" + "\n" + TAB + `--at-harmony-primary: ` + _color + ";\n" + "}\n"

		// NEXT: Build theme
		// buildTheme(&theme)

		// TODO: This is temp... remove this
		hex, _ := colorful.Hex(_color)

		// Build harmony
		colors := harmony.TriadicHarmony(hex)

		// Build shades / tints / tones / offWB
		for i, color := range colors {
			h, s, _ := color.Hsl()
			offW := colorful.Hsl(h, s, 0.9667)
			offB := colorful.Hsl(h, s, 0.0333)
			title := "\nColor " + strconv.Itoa(i+1) + " : " + color.Hex() + "     \n"
			fmt.Println(title)
			titleLen := utf8.RuneCountInString(title)
			shadesStr := "Shades "
			var _len = 0
			shades := c.CalcShades(color, 5)
			_len = utf8.RuneCountInString(shadesStr)
			for i := 0; i < (titleLen - _len); i++ {
				shadesStr += "-"
			}
			shadesStr += " "
			for _, shade := range shades {
				// cw := " W: " + strconv.FormatFloat(c.ContrastRatio(shade, offW), 'f', 2, 64) + " "
				// cb := "B: " + strconv.FormatFloat(c.ContrastRatio(shade, offB), 'f', 2, 64) + " "
				shadesStr += colorStr(shade)
			}

			fmt.Println(shadesStr)

			tonesStr := "Tones "
			tones := c.CalcTones(color, 5)
			_len = utf8.RuneCountInString(tonesStr)
			for i := 0; i < (titleLen - _len); i++ {
				tonesStr += "-"
			}
			tonesStr += " "
			for _, tone := range tones {
				tonesStr += colorStr(tone)
			}
			fmt.Println(tonesStr)

			tintsStr := "Tints "
			_len = utf8.RuneCountInString(tintsStr)
			tints := c.CalcTints(color, 5)
			for i := 0; i < (titleLen - _len); i++ {
				tintsStr += "-"
			}
			tintsStr += " "
			for _, tint := range tints {
				tintsStr += colorStr(tint)
			}
			fmt.Println(tintsStr)

			offWBStr := "Off-White / Off-Black "
			_len = utf8.RuneCountInString(offWBStr)
			for i := 0; i < (titleLen - _len); i++ {
				offWBStr += "-"
			}
			offWBStr += " "

			offWBStr += colorStr(offW)
			offWBStr += colorStr(offB)

			fmt.Println(offWBStr)

		}

		// NEXT: Write theme to file
		// writeTheme(theme)

		fmt.Println("\nAutoTheme Finished!\n", theme)
	},
}

func colorStr(color colorful.Color) string {
	return c.Str(
		" "+color.Hex()+" ",
		nil,
		&c.Color{
			R: int(color.R * 255),
			G: int(color.G * 255),
			B: int(color.B * 255),
		},
	)
}

func init() {
	cobra.OnInitialize(config.LoadConfig)

	// REFACTOR: Do we want to support flags for each value in the config file?
	// Root command flags
	rootCmd.Flags().StringP("color", "c", "", "Color for AutoTheme to use.\n    (default is randomly set at build time)")
	rootCmd.Flags().StringP("harmony", "a", "complementary", "Harmony for AutoTheme to use.")
	rootCmd.Flags().StringP("outdir", "o", "dist", "Output directory relative to current working directory for the generated CSS file")

	// Bind flags to viper
	viper.BindPFlag("color", rootCmd.Flags().Lookup("color"))
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
