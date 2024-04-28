package config

import (
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"math"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Primary    string
	Harmony    string
	Output     string
	Entrypoint string
	Prefix     string
	Preview    bool
	Tailwind   bool
	Overrides  OverrideT
	UseClasses UseClassesI
}

func getUseClasses() UseClassesI {
	uc := viper.Get("useClasses")
	switch v := uc.(type) {
	case bool:
		return UseClassesBool(v)
	case map[string]interface{}:
		return UseClassesT{
			Colors: ColorsT{
				Primary: viper.GetBool("useClasses.colors.primary"),
				Accent1: viper.GetBool("useClasses.colors.accent1"),
				Accent2: viper.GetBool("useClasses.colors.accent2"),
				Accent3: viper.GetBool("useClasses.colors.accent3"),
				Accent4: viper.GetBool("useClasses.colors.accent4"),
				Accent5: viper.GetBool("useClasses.colors.accent5"),
			},
			Gradients: GradientArray{
				GradientTuple{
					First:  Primary,
					Second: Accent1,
				},
			},
			Opacity: viper.GetBool("useClasses.opacity"),
			Spacing: viper.GetBool("useClasses.spacing"),
			Noise:   viper.GetBool("useClasses.noise"),
		}
	default:
		return UseClassesBool(false)

	}

}

func GetConfig() Config {
	// check some values and set defaults if not provided
	if viper.GetString("primary") == "" {
		c := utils.GetRandomColor()
		viper.Set("primary", c)
	}
	if viper.GetString("harmony") == "" {
		h := harmony.GetRandomHarmony()
		viper.Set("harmony", h)
	}
	if viper.GetFloat64("scalar") == 0 {
		s := (1 + math.Sqrt(5)) / 2
		viper.Set("scalar", s)
	}

	// Return the config struct
	return Config{
		Primary:    viper.GetString("primary"),
		Harmony:    viper.GetString("harmony"),
		Output:     viper.GetString("output"),
		Entrypoint: viper.GetString("entrypoint"),
		Prefix:     viper.GetString("prefix"),
		Preview:    viper.GetBool("preview"),
		Overrides: OverrideT{
			FontSize:  viper.GetFloat64("overrides.fontSize"),
			Scalar:    viper.GetFloat64("overrides.scalar"),
			DarkMode:  viper.GetBool("overrides.darkMode"),
			Colors:    ColorsBool(true),
			Opacity:   viper.GetBool("overrides.opacity"),
			Noise:     viper.GetBool("overrides.noise"),
			Spacing:   viper.GetBool("overrides.spacing"),
			Gradients: GradientBool(true),
		},
		UseClasses: getUseClasses(),
		Tailwind:   viper.GetBool("tailwind"),
	}
}

func LoadConfig() {
	// Load the config from the config file

	viper.AutomaticEnv()

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
		utils.Log.Info("Config file provided %s", cfgfile)
		viper.SetConfigFile(cfgfile)
	} else {
		// Use default config file name and directory
		viper.SetConfigName("autotheme")
		viper.AddConfigPath(".")
		viper.AddConfigPath("./config")
		viper.AddConfigPath("./.config")
	}

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err != nil {
		// Handle errors reading the config file
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found
			utils.Log.Warn("Using zero-config...")
		} else {
			utils.Log.Error("\nError found in config file at: %s", viper.ConfigFileUsed())
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
	utils.Log.Info("Using config file: %s\n", viper.ConfigFileUsed())
}
