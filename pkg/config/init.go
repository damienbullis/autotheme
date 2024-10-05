package config

import (
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
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
	Tailwind  bool
	FontSize  float64
	Scalar    float64
	DarkMode  bool
	Opacity   bool
	Noise     bool
	Spacing   bool
	Gradients bool

	// TODO: Classes in the future maybe
	// UseClasses UseClassesI
}

// func getUseClasses() UseClassesI {
// 	uc := viper.Get("useClasses")
// 	switch v := uc.(type) {
// 	case bool:
// 		return UseClassesBool(v)
// 	case map[string]interface{}:
// 		return UseClassesT{
// 			Colors: ColorsT{
// 				Primary: viper.GetBool("useClasses.colors.primary"),
// 				Accent1: viper.GetBool("useClasses.colors.accent1"),
// 				Accent2: viper.GetBool("useClasses.colors.accent2"),
// 				Accent3: viper.GetBool("useClasses.colors.accent3"),
// 				Accent4: viper.GetBool("useClasses.colors.accent4"),
// 				Accent5: viper.GetBool("useClasses.colors.accent5"),
// 			},
// 			Gradients: GradientArray{
// 				GradientTuple{
// 					First:  Primary,
// 					Second: Accent1,
// 				},
// 			},
// 			Opacity: viper.GetBool("useClasses.opacity"),
// 			Spacing: viper.GetBool("useClasses.spacing"),
// 			Noise:   viper.GetBool("useClasses.noise"),
// 		}
// 	default:
// 		return UseClassesBool(false)

// 	}

// }

func GetConfig() Config {
	// check some values and set defaults if not provided
	if viper.GetString("primary") == "" {
		utils.Log.Info("Choosing a random primary color...\n")
		c := utils.GetRandomColor()
		viper.Set("primary", c)
	}
	if viper.GetString("harmony") == "" {
		utils.Log.Info("Choosing a random harmony...\n")
		h := harmony.GetRandomHarmony()
		viper.Set("harmony", h)
	}
	if viper.GetFloat64("scalar") == 0 {
		utils.Log.Info("Setting scalar to golden ratio...\n")
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

		// Config only options
		FontSize:  viper.GetFloat64("fontSize"),
		Scalar:    viper.GetFloat64("scalar"),
		DarkMode:  viper.GetBool("darkMode"),
		Noise:     viper.GetBool("noise"),
		Spacing:   viper.GetBool("spacing"),
		Gradients: viper.GetBool("gradiets"),

		Tailwind: viper.GetBool("tailwind"),
		// UseClasses: getUseClasses(),
	}
}

func LoadConfig() {
	// Load the config from the config file
	viper.AutomaticEnv()
	utils.InitLogger()

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
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
			utils.Log.Error("Error found in config file at: %s\n", viper.ConfigFileUsed())
			utils.Log.Error(err.Error() + "\n")
			os.Exit(0)
		}
	}
	utils.Log.Info("Using config file: %s\n", viper.ConfigFileUsed())
}
