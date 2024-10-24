package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/utils"
	"os"
)

func WriteTailwind(
	config c.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	if config.Tailwind {
		// utils.Log.Info("Writing tailwind config...\n")
		// utils.Log.Info("%+v\n", config)
		// utils.Log.Info("%+v\n", palette)
		// utils.Log.Info("%+v\n", scale)
		// utils.Log.Info("%+v\n", noise)
		// utils.Log.Error("Not implemented yet")

		file := "tailwind.config.js"
		tailwind, err := readFile(file)
		if err != nil {
			utils.Log.Warn("could not find tailwind.config.js")
			tailwind, err = readFile("tailwind.config.ts")
		}

		if err != nil {
			utils.Log.Error("could not find tailwind.config.ts")
		}

		utils.Log.Info("Writing tailwind config...%s\n", tailwind)
	}
}

func readFile(file string) (string, error) {
	// Read the tailwind file
	content, err := os.ReadFile(file)
	if err != nil {
		return "", err
	}
	return string(content), nil
}
