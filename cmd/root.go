package cmd

import (
	"fmt"

	"autotheme/pkg/config"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "autotheme",
	Short: "A zero-config theme generator using color theory",
	// Add global flags and configurations here
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		// Handle errors here
		fmt.Println(err)
	}

	// Load the config
	cfg := config.LoadConfig()
	fmt.Println("autotheme root", cfg)
}
