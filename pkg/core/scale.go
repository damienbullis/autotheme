package core

import (
	"autotheme/pkg/config"
	"math"
)

// GenerateScale generates the spacing for the theme
func GenerateScale(config config.Config) []float64 {
	scalar := config.Override.Scalar
	root := 1.0
	spacing := [10]float64{
		(root / scalar),
		root,
	}

	for i := 2; i < 10; i++ {
		spacing[i] = root * calcScale(scalar, i-1)
	}

	return spacing[:]
}

func calcScale(scalar float64, power int) float64 {
	return math.Pow(scalar, float64(power))
}
