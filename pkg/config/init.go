package config

import (
	"autotheme/pkg/constants"
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
	Darkmode   bool
	Noise      bool
	Gradients  bool
	Prefix     string
	RootFont   int
	// TODO: Add more config options
}

const stage = constants.StageInit

func GetConfig() Config {
	utils.Log.Debug("[ %s ] GetConfig - Start", stage)
	// check some values and set defaults if not provided
	if viper.GetString("primary") == "" {
		c := utils.GetRandomColor()
		utils.Log.Debug("[ %s ] No color provided... using %s", stage, c)
		viper.Set("primary", c)
	}
	if viper.GetString("harmony") == "" {
		h := harmony.GetRandomHarmony()
		utils.Log.Debug("[ %s ] No harmony provided... using %s", stage, h)
		viper.Set("harmony", h)
	}
	if viper.GetFloat64("scalar") == 0 {
		s := (1 + math.Sqrt(5)) / 2
		utils.Log.Debug("[ %s ] No scalar provided... using %f", stage, s)
		viper.Set("scalar", s)
	}
	utils.Log.Debug("[ %s ] GetConfig - End", stage)

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
		utils.Log.Info("[ %s ] Config file provided %s", stage, cfgfile)
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
			utils.Log.Debug("[ %s ] Using zero-config...", stage)
		} else {
			utils.Log.Error("\nError found in config file at: %s", viper.ConfigFileUsed())
			utils.Log.Error(err.Error())
			os.Exit(0)
		}
	}
}
