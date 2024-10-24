package core

import (
	"autotheme/pkg/config"
	"autotheme/pkg/utils"

	"github.com/spf13/viper"
)

func WriteConfig() {
	config := config.GetConfig()
	utils.Log.Info("%+v\n", config)

	if err := viper.WriteConfigAs("./autotheme.yml"); err != nil {
		utils.Log.Error("Error writing configuration file: %s", err)
	}
}
