package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"path/filepath"
)

func WritePreview(config c.Config, palette Palette, scale []float64) {

	if config.Preview {
		indexHtml := ""
		utils.Log.Error("TODO: Finish building index.html")

		buildIndexHtml(&indexHtml, palette, config)
		writeIndexHtml(indexHtml, config)
	}
}

func writeIndexHtml(indexHtml string, config c.Config) {
	path, _ := filepath.Split(config.Output)

	if err := utils.WriteFile(filepath.Join(path, "autotheme.html"), indexHtml); err != nil {
		utils.Log.Error(err.Error())
	} else {
		utils.Log.Info("Wrote index.html")
	}
}

func buildIndexHtml(htmlString *string, palette Palette, config c.Config) {
	utils.Log.Error("TODO: Finish building index.html")
	*htmlString += `<!DOCTYPE html>`
}

func RemovePreview(config c.Config) {
	path, _ := filepath.Split(config.Output)
	if result, err := utils.RemoveFile(filepath.Join(path, "autotheme.html")); err != nil {
		utils.Log.Error(err.Error())
	} else if result {
		utils.Log.Info("\nautotheme.html " + utils.FgStr("grey", "removed... ") + constants.IconCheck.Str())
	}
}
