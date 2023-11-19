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
	// check some values and set defaults if not provided
	if viper.GetString("primary") == "" {
		c := utils.GetRandomColor()
		fmt.Println("No color provided... using random color: " + c)
		viper.Set("primary", c)
	}
	if viper.GetString("harmony") == "" {
		h := harmony.GetRandomHarmony()
		fmt.Println("No harmony provided... using random harmony: " + h)
		viper.Set("harmony", h)
	}
	if viper.GetFloat64("scalar") == 0 {
		s := (1 + math.Sqrt(5)) / 2
		fmt.Println("No scalar provided... using default: " + fmt.Sprintf("%f", s))
		viper.Set("scalar", s)
	}
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

	utils.Log, err = utils.NewLogger(viper.GetBool("silent"), viper.GetString("log-file"))
	if err != nil {
		panic(err)
	}

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
		utils.Log.Info("Using config file: " + cfgfile)
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
			utils.Log.Info("Using zero-config...")
		} else {
			fmt.Println("\nError found in config file at: ", viper.ConfigFileUsed(), "\n", err)
			os.Exit(0)
		}
	}
}
