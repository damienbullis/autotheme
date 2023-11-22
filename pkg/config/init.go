package config

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"math"
	"os"

	"github.com/lucasb-eyer/go-colorful"
	"github.com/spf13/viper"
)

type Config struct {
	Primary    string
	Harmony    string
	Scalar     float64
	Output     string
	Entrypoint string
	Darkmode   bool
	Noise      bool
	Gradients  bool
	Prefix     string
	RootFont   int
	// TODO: Add more config options
}

func GetConfig() Config {
	utils.Log.Debug("GetConfig - Start")
	// check some values and set defaults if not provided
	if viper.GetString("primary") == "" {
		c := utils.GetRandomColor()
		utils.Log.Info("%s %s | No color provided... using random color: %s", constants.IconCog.Str(), constants.StageInit, c)
		viper.Set("primary", c)
	}
	if viper.GetString("harmony") == "" {
		h := harmony.GetRandomHarmony()
		utils.Log.Info("%s %s | No harmony provided... using random harmony: %s", constants.IconCog.Str(), constants.StageInit, h)
		viper.Set("harmony", h)
	}
	if viper.GetFloat64("scalar") == 0 {
		s := (1 + math.Sqrt(5)) / 2
		utils.Log.Info("%s %s | No scalar provided... using default: "+utils.Str(
			"%f",
			&colorful.Color{
				R: 0.5,
				G: 0.5,
				B: 0.5,
			},
			nil,
		), constants.IconCog.Str(), constants.StageInit, s)
		viper.Set("scalar", s)
	}
	utils.Log.Debug("GetConfig - End")

	// Return the config struct
	return Config{
		Primary:    viper.GetString("primary"),
		Harmony:    viper.GetString("harmony"),
		Scalar:     viper.GetFloat64("scalar"),
		Output:     viper.GetString("output"),
		Entrypoint: viper.GetString("entrypoint"),
		Darkmode:   viper.GetBool("darkmode"),
		Noise:      viper.GetBool("noise"),
		Gradients:  viper.GetBool("gradients"),
		Prefix:     viper.GetString("prefix"),
		RootFont:   viper.GetInt("fontsize"),
	}
}

func LoadConfig() {
	// Load the config from the config file

	viper.AutomaticEnv()

	// Create logger
	var err error

	var logFile interface{}
	if viper.IsSet("log-file") {
		logFile = viper.GetString("log-file")
	} else {
		logFile = nil
	}

	utils.Log, err = utils.NewLogger(viper.GetBool("silent"), logFile)
	if err != nil {
		panic(err)
	}

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
		utils.Log.Info("%s Using config file: %s", constants.StageInit, cfgfile)
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
			utils.Log.Info("%s %s | Using zero-config...", constants.IconCog.Str(), constants.StageInit)
		} else {
			utils.Log.Error("\nError found in config file at: %s", viper.ConfigFileUsed())
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
}
