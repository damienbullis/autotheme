package config

import (
	"autotheme/pkg/utils"
	"fmt"
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
	var entry string
	if e := viper.Get("entrypoint"); e == nil {
		entry = ""
	} else {
		if _, ok := e.(string); !ok {
			fmt.Println("Error: entrypoint must be a string")
			os.Exit(0)
		}
		entry = string(e.(string))
	}

	return Config{
		Primary:    viper.GetString("primary"),
		Harmony:    viper.GetString("harmony"),
		Scalar:     viper.GetFloat64("scalar"),
		Output:     viper.GetString("output"),
		Entrypoint: entry,
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

	if cfgfile := viper.GetString("config"); cfgfile != "" {
		// Use config file from the flag.
		fmt.Println("Using config file:", cfgfile)
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
			fmt.Println("\nUsing zero-config...")
		} else {
			fmt.Println("\nError found in config file at: ", viper.ConfigFileUsed(), "\n", err)
			os.Exit(0)
		}
	}

	PrintSettings()
}

// NEXT: Remove this later
func PrintSettings() {
	fmt.Println()
	mapped := viper.AllSettings()
	utils.PrintMap(mapped)
	fmt.Println()
}
