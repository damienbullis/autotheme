package config

import (
	"fmt"

	"github.com/spf13/viper"
)

type Config struct {
	Color    string
	Scalar   float64
	Outdir   string
	Darkmode bool
	// TODO: Add more config options
}

func LoadConfig() {
	// Load the config from the config file

	viper.AutomaticEnv()

	viper.SetConfigName(".autotheme")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("./.config")

	if err := viper.ReadInConfig(); err != nil {
		// Handle errors reading the config file
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Config file not found
			fmt.Println("Config file not found.")

		} else {
			fmt.Println("Error found in config file at: ", viper.ConfigFileUsed(), "\n", err)
		}

	}

	// Print config values
	fmt.Println("Config values:")
	mapped := viper.AllSettings()

	for key, value := range mapped {
		fmt.Println(key, ":", value)
	}
}
