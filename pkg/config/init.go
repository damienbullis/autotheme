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
	Scalar     float64
	Output     string
	Entrypoint string
	UseClasses UseClassesI
	Darkmode   bool
	Noise      bool
	Gradients  bool
	Prefix     string
	RootFont   int
	Preview    bool
	// TODO: Add more config options
}

func checkUseClasses() UseClassesI {
	useClasses := viper.Get("use-classes")
	switch v := useClasses.(type) {
	case bool:
		return UseClassesBool(v)
	case UseClassesI:
		viper.SetDefault("use-classes.colors", true)
		viper.SetDefault("use-classes.spacing", true)
		viper.SetDefault("use-classes.noise", true)
		viper.SetDefault("use-classes.gradients", true)

		var useClassesT UseClassesT
		if err := viper.UnmarshalKey("use-classes", &useClassesT); err != nil {
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
		return useClassesT
	default:
		return UseClassesBool(true)
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
		Scalar:     viper.GetFloat64("scalar"),
		Output:     viper.GetString("output"),
		Entrypoint: viper.GetString("entrypoint"),
		UseClasses: checkUseClasses(),
		Darkmode:   viper.GetBool("darkmode"),
		Noise:      viper.GetBool("noise"),
		Gradients:  viper.GetBool("gradients"),
		Prefix:     viper.GetString("prefix"),
		RootFont:   viper.GetInt("fontsize"),
		Preview:    viper.GetBool("preview"),
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
			// utils.Log.Debug("[ %s ] Using zero-config...", stage)
		} else {
			utils.Log.Error("\nError found in config file at: %s", viper.ConfigFileUsed())
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
}
