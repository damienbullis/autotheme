package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/utils"
	"path/filepath"
)

func WritePreview(config c.Config, palette Palette, scale []float64) {

	if config.Preview {
		indexHtml := ""
		utils.Log.Error("Finish building index.html")

		buildIndexHtml(&indexHtml, palette, config)
		writeIndexHtml(indexHtml, config)
	}
}

func writeIndexHtml(indexHtml string, config c.Config) {
	path, _ := filepath.Split(config.Output)

	if err := writeFile(filepath.Join(path, "autotheme.html"), indexHtml); err != nil {
		utils.Log.Error(err.Error())
	} else {
		utils.Log.Info("Wrote index.html")
	}
}

func buildIndexHtml(htmlString *string, palette Palette, config c.Config) {
	utils.Log.Error("Finish building index.html")
	*htmlString += `<!DOCTYPE html>`
}
