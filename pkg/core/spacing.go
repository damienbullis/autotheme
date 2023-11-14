package core

import (
	"autotheme/pkg/config"
)

func GenerateSpacing(config config.Config, scaling []float64) []float64 {
	const root = 4.0

	spacing := [8]float64{}

	for i := 0; i < 8; i++ {
		spacing[i] = root * scaling[i]
	}

	return spacing[:]
}
