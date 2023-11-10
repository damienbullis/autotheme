package core

import (
	"autotheme/pkg/config"
)

func GenerateText(config *config.Config, scaling *[]float64) []float64 {
	const root = 16.0

	text := [8]float64{
		(*scaling)[0] * root,
		(*scaling)[1] * root,
		(*scaling)[2] * root,
		(*scaling)[3] * root,
		(*scaling)[4] * root,
		(*scaling)[5] * root,
		(*scaling)[6] * root,
		(*scaling)[7] * root,
	}

	return text[:]
}
