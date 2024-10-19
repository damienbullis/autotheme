package tailwind

import (
	"autotheme/pkg/utils"
	"os"
)

func readFile(file string) (string, error) {
	// Read the tailwind file
	content, err := os.ReadFile(file)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func WriteTailwind(content string) error {
	// Write the tailwind file

	file := "tailwind.config.js"
	tailwind, err := readFile(file)
	if err != nil {
		utils.Log.Warn("could not find tailwind.config.js")
		tailwind, err = readFile("tailwind.config.ts")
	}

	if err != nil {
		utils.Log.Error("could not find tailwind.config.ts")
		return err
	}

	utils.Log.Info("Writing tailwind config...\n", tailwind)

	return nil
}
