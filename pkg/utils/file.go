package utils

import (
	"os"
	"path/filepath"
)

func WriteFile(output string, content string) error {
	outputPath, filename := filepath.Split(output)
	if outputPath == "" {
		Log.Info("\n%s\n", content)
		return nil
	}

	// Ensure the output path exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		err := os.MkdirAll(outputPath, 0755)
		if err != nil {
			return err
		}
	}

	// Check if the file already exists
	filePath := filepath.Join(outputPath, filename)
	if _, err := os.Stat(filePath); err == nil {
		Log.Warn(FgStr("grey", "Overwriting your previous %s..."), filename)
	}

	// Create or open the file
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	// Write the content to the file
	_, err = file.WriteString(content)
	if err != nil {
		return err
	}

	return nil
}

func RemoveFile(path string) (bool, error) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return false, nil
	}
	if err := os.Remove(path); err == nil {
		Log.Warn(FgStr("grey", "Removing %s...\n"), filepath.Base(path))
		return true, nil
	} else {
		return false, err
	}
}
