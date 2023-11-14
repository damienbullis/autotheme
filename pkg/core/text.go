package core

import (
	"autotheme/pkg/config"
)

func GenerateText(config config.Config, scaling []float64) []float64 {
	const root = 16.0

	text := [8]float64{}

	for i := 0; i < 8; i++ {
		text[i] = root * scaling[i]
	}

	return text[:]
}
