package harmony

import (
	"math/rand"

	"github.com/lucasb-eyer/go-colorful"
)

const (
	// Main Harmony
	Complementary      = "complementary"
	SplitComplementary = "split-complementary"
	Analogous          = "analogous"
	Triadic            = "triadic"
	Tetradic           = "tetradic"
	Rectangle          = "rectangle"
	Square             = "square"
	// Creative
	BiPolar      = "bi-polar"
	Aurelian     = "aurelian"
	LunarEclipse = "lunar-eclipse"
	Retrograde   = "retrograde"
)

var HarmonyTypes = []string{
	Complementary,
	SplitComplementary,
	Analogous,
	Triadic,
	Tetradic,
	Rectangle,
	Square,
	BiPolar,
	Aurelian,
	LunarEclipse,
	Retrograde,
}

func GetRandomHarmony() string {
	return HarmonyTypes[rand.Intn(len(HarmonyTypes))]
}

func GetHarmonyFn(harmony string) func(colorful.Color) []colorful.Color {
	switch harmony {
	case Complementary:
		return ComplementaryHarmony
	case SplitComplementary:
		return SplitComplementaryHarmony
	case Analogous:
		return AnalogousHarmony
	case Triadic:
		return TriadicHarmony
	case Tetradic:
		return TetradicHarmony
	case Rectangle:
		return RectangleHarmony
	case Square:
		return SquareHarmony
	case BiPolar:
		return BiPolarHarmony
	case Aurelian:
		return AurelianHarmony
	case LunarEclipse:
		return LunarEclipseHarmony
	case Retrograde:
		return RetrogradeHarmony
	default:
		return nil
	}

}
