package core

import (
	"autotheme/pkg/config"
	"fmt"
	"math/rand"
	"strings"
)

// Noise represents the possible values for the feTurbulence type.
type Noise string

const (
	FractalNoise Noise = "fractalNoise"
	Turbulence   Noise = "turbulence"
	// Add more constants as needed
)

func urlEncode(input string) string {
	// URL encode the input string
	encoded := input
	encoded = strings.Replace(encoded, "#", "%23", -1)
	encoded = strings.Replace(encoded, "<", "%3C", -1)
	encoded = strings.Replace(encoded, ">", "%3E", -1)
	encoded = strings.Replace(encoded, "\"", "'", -1)
	// Replace the + with a space
	encoded = strings.Replace(encoded, "+", " ", -1)
	// replace the
	return encoded
}

func generateSVG(typeValue Noise, baseFrequency float64, numOctaves int) string {
	// SVG header
	svg := `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'>`

	// give me the
	// feTurbulence filter
	filter := fmt.Sprintf(
		`<filter id='noise'>
<feTurbulence type='%s' baseFrequency='%f' numOctaves='%d' stitchTiles='stitch' />
</filter>`, typeValue, baseFrequency, numOctaves,
	)

	// Rectangular shape using the noise filter
	rect := `<rect width='100%" height='100%' filter='url(#noise)' />`

	// SVG closing tag
	svgClosing := `</svg>`

	// Combine all parts to form the final SVG string
	finalSVG := fmt.Sprintf("%s %s %s %s", svg, filter, rect, svgClosing)

	return urlEncode(finalSVG)
}

func generateRandomFloat(min, max float64) float64 {
	// Generate a random number between min and max
	return min + rand.Float64()*(max-min)
}

func generateRandomNumber(min, max int) int {
	// Generate a random number between min and max
	return min + rand.Intn(max-min)
}

func GenerateNoise(config *config.Config) string {
	var noise Noise
	if config.Noise == false {
		return ""
	}

	if config.Noise == FractalNoise {
		noise = FractalNoise
	} else {
		noise = Turbulence
	}

	svg := generateSVG(noise, generateRandomFloat(0.63, 0.78), generateRandomNumber(2, 5))

	// Add the SVG header
	return "data:image/svg+xml," + svg
}
