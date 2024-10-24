package config

import (
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"fmt"
	"math"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	// Cli options
	Primary    string
	Harmony    string
	Output     string
	Entrypoint string
	Prefix     string
	Preview    bool

	// Config only options
	FontSize     float64
	Scalar       float64
	DarkMode     bool
	Noise        bool
	Spacing      bool
	Gradients    bool
	Tailwind     bool
	UseHarmonies []string
}

var _config *Config

func GetConfig() *Config {
	// If the config is already cached, return it
	if _config != nil {
		return _config
	}
	// Validate config values
	checkColor()
	checkHarmony()
	scale := checkScalar()
	checkUseHarmonies()

	// Cache the config
	_config = &Config{
		Primary:    viper.GetString("color"),
		Harmony:    viper.GetString("harmony"),
		Output:     viper.GetString("output"),
		Entrypoint: viper.GetString("entrypoint"),
		Prefix:     "at",
		Preview:    viper.GetBool("preview"),

		// Config only options
		FontSize:  viper.GetFloat64("font-size"),
		Scalar:    scale,
		DarkMode:  viper.GetBool("dark-mode"),
		Noise:     viper.GetBool("noise"),
		Spacing:   viper.GetBool("spacing"),
		Gradients: viper.GetBool("gradients"),

		Tailwind:     viper.GetBool("tailwind"),
		UseHarmonies: viper.GetStringSlice("use-harmonies"),
	}

	return _config
}
func checkColor() {
	if viper.GetString("color") == "" {
		// If color is default, choose a random color
		utils.Log.Info("Choosing a random primary color...\n")
		c := utils.GetRandomColor()
		viper.Set("color", c)
	} else {
		// If a color is provided, check if it's valid
		value, ok := viper.Get("color").(string)
		if !ok {
			utils.Log.Error("color must be a string")
			os.Exit(0)
		}
		if err := CheckColorFlag(value); err != nil {
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
}
func checkHarmony() {
	if viper.GetString("harmony") == "" {
		// If harmony is the default, choose a random harmony
		utils.Log.Info("Choosing a random harmony...\n")
		h := harmony.GetRandomHarmony()
		viper.Set("harmony", h)
	} else {
		// If a harmony is provided, check if it's valid
		if value, ok := viper.Get("harmony").(string); !ok {
			utils.Log.Error("harmony must be a string")
			os.Exit(0)
		} else if err := CheckHarmonyFlag(value); err != nil {
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
}
func checkScalar() float64 {
	if scalar := viper.GetFloat64("scalar"); scalar == 0.0 {
		utils.Log.Info("Setting scalar to golden ratio...\n")
		s := (1 + math.Sqrt(5)) / 2
		return s
	}
	if value, ok := viper.Get("scalar").(float64); !ok {
		utils.Log.Error("scalar must be a float")
		os.Exit(0)
	} else if value <= 0.0 {
		utils.Log.Error("scalar must be greater than 0")
		os.Exit(0)
	} else {
		return value
	}

	return 0.0
}

// checkUseHarmonies checks if the use-harmonies config value is valid
func checkUseHarmonies() {
	// Check for default value
	if viper.Get("use-harmonies") == nil {
		return
	}
	if harmonies, ok := viper.Get("use-harmonies").([]string); !ok {
		utils.Log.Error("use-harmonies must be a list of strings")
		os.Exit(0)
	} else {

		for _, h := range harmonies {
			if err := CheckHarmonyFlag(h); err != nil {
				utils.Log.Error(err.Error())
				os.Exit(0)
			}
		}
	}

}

func LoadConfig() {
	fmt.Println("Loading config...")
	// Load the config from the config file
	viper.AutomaticEnv()
	utils.InitLogger()

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgfile)
	} else {
		// Use default config file name and directory
		viper.SetConfigName("autotheme")
		viper.SetConfigType("yaml")
		viper.AddConfigPath(".")
		viper.AddConfigPath("./config")
		viper.AddConfigPath("./.config")
	}

	// If a config file is found, read it in.
	if err := viper.ReadInConfig(); err != nil {
		// Handle errors reading the config file
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found
			utils.Log.Warn("Using zero-config...\n")
		} else {
			utils.Log.Error("Error found in config file at: %s\n", viper.ConfigFileUsed())
			utils.Log.Error(err.Error() + "\n")
			os.Exit(0)
		}
	}
	// utils.Log.Info("Using config file: %s\n", viper.ConfigFileUsed())
}
