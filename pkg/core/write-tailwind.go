package core

import (
	c "autotheme/pkg/config"
	"autotheme/pkg/utils"
)

func WriteTailwind(
	config c.Config,
	palette Palette,
	scale []float64,
	noise string,
) {
	utils.Log.Info("Writing tailwind config...\n")
	utils.Log.Info("%+v\n", config)
	utils.Log.Info("%+v\n", palette)
	utils.Log.Info("%+v\n", scale)
	utils.Log.Info("%+v\n", noise)
	utils.Log.Error("Not implemented yet")
	// Wrapper
	// /** @type {import('tailwindcss').Config} */
	// module.exports = {
	// 		...
	// }
	/*

				// Theme
				theme: {
					... FEATURE: Add theme
				},

				// Sizing
				spacing: {
					... FEATURE: Add spacing
				},

				// Darkmode
				darkMode: ['class', '<config.Prefix>-dark'],

				// Noise? not sure... FEATURE: Add noise to tailwind config
				// Gradients? not sure... FEATURE: Add gradients to tailwind config

		  // ...
		}


	*/

}
