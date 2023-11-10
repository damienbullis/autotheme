package core

import (
	"autotheme/pkg/config"
	"fmt"
	"math"
)

type Spacing struct {
	Scale float64
}

// GenerateSpacing generates the spacing for the theme
func GenerateSpacing(config *config.Config) []*Spacing {
	scalar := config.Scalar
	if scalar == 0.0 {
		scalar = (1 + math.Sqrt(5)) / 2
		fmt.Println("No scalar provided, using default...(" + fmt.Sprintf("%f", scalar) + ")")
	}

	const root = 4.0
	spacing := []*Spacing{
		{Scale: root / scalar},
		{Scale: root},
	}

	for i := 2; i < 10; i++ {
		spacing[i] = &Spacing{Scale: root * calcScale(scalar, i-1)}
	}

	return spacing
}

func calcScale(scalar float64, power int) float64 {
	return math.Pow(scalar, float64(power))
}
