package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Color    string
	Harmony  string
	Scalar   float64
	Outdir   string
	Darkmode bool
	// TODO: Add more config options
}

func GetConfig() Config {
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		fmt.Println("Error unmarshalling config:", err)
	}

	return config
}

func LoadConfig() {
	// Load the config from the config file

	viper.AutomaticEnv()

	if cfgfile := viper.Get("config"); cfgfile != "" {
		// Use config file from the flag.
		fmt.Println("Using config file:", cfgfile)
		viper.SetConfigFile(cfgfile.(string))
	} else {
		// Use default config file name and directory
		viper.SetConfigName(".autotheme")
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

	// Print config values
	fmt.Println("\nConfig values:")
	mapped := viper.AllSettings()
	for key, value := range mapped {
		keyLen := len(key)
		keyStr := key
		for i := 0; i < 30-keyLen; i++ {
			keyStr += " "
		}
		fmt.Println(keyStr, ":", value)
	}
}
