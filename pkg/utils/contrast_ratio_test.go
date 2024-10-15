package utils_test

import (
	. "autotheme/pkg/utils"
	"math"
	"testing"

	"github.com/lucasb-eyer/go-colorful"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

// Entry point for the Ginkgo test suite
func TestContrastRatio(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "ContrastRatio Suite")
}

var _ = Describe("ContrastRatio", func() {
	// Helper to round contrast ratio to 2 decimal places (for easier comparison in tests)
	round := func(val float64) float64 {
		return math.Round(val*100) / 100
	}

	Context("Basic contrast ratio calculations", func() {
		It("should calculate contrast ratio correctly for white and black", func() {
			white := colorful.Color{R: 1, G: 1, B: 1} // white color
			black := colorful.Color{R: 0, G: 0, B: 0} // black color

			Expect(ContrastRatio(white, black)).To(Equal(21.0))
		})

		It("should calculate contrast ratio correctly for white and grey", func() {
			white := colorful.Color{R: 1, G: 1, B: 1}
			grey := colorful.Color{R: 0.5, G: 0.5, B: 0.5} // grey color

			// Corrected expected contrast ratio
			Expect(round(ContrastRatio(white, grey))).To(Equal(3.98))
		})

		It("should calculate contrast ratio correctly for two identical colors", func() {
			red := colorful.Color{R: 1, G: 0, B: 0}

			Expect(ContrastRatio(red, red)).To(Equal(1.0)) // Identical colors should always have 1.0 contrast
		})

	})

	Context("Edge cases and validation", func() {
		It("should handle very small differences in luminance", func() {
			color1 := colorful.Color{R: 0.001, G: 0.001, B: 0.001}
			color2 := colorful.Color{R: 0.002, G: 0.002, B: 0.002}

			Expect(round(ContrastRatio(color1, color2))).To(BeNumerically("~", 1.0, 0.01)) // Almost identical colors
		})

		It("should handle colors with a very high contrast ratio", func() {
			color1 := colorful.Color{R: 0.0, G: 0.0, B: 0.0} // almost black
			color2 := colorful.Color{R: 1.0, G: 1.0, B: 1.0} // white

			Expect(ContrastRatio(color1, color2)).To(Equal(21.0)) // Extreme black and white should have maximum contrast
		})
	})

	Context("Testing against known WCAG contrast values", func() {
		It("should match known contrast ratio for specific colors", func() {
			color1 := colorful.Color{R: 0.22, G: 0.33, B: 0.44}
			color2 := colorful.Color{R: 0.88, G: 0.77, B: 0.66}

			// Corrected expected contrast ratio
			Expect(round(ContrastRatio(color1, color2))).To(Equal(4.74))
		})

	})
})

var _ = Describe("relativeLuminance", func() {
	Context("Basic luminance calculations", func() {
		It("should calculate luminance correctly for white", func() {
			white := colorful.Color{R: 1, G: 1, B: 1}

			Expect(RelativeLuminance(white)).To(BeNumerically("~", 1.0, 0.001)) // Luminance of white should be very close to 1
		})

		It("should calculate luminance correctly for black", func() {
			black := colorful.Color{R: 0, G: 0, B: 0}

			Expect(RelativeLuminance(black)).To(BeNumerically("~", 0.0, 0.001)) // Luminance of black should be very close to 0
		})

		It("should calculate luminance correctly for pure red", func() {
			red := colorful.Color{R: 1, G: 0, B: 0}

			Expect(RelativeLuminance(red)).To(BeNumerically("~", 0.2126, 0.001)) // Approximate luminance value for red
		})
	})

	Context("Gamma adjustment and edge cases", func() {
		It("should handle gamma adjustment for very low values", func() {
			color := colorful.Color{R: 0.03, G: 0.03, B: 0.03}

			Expect(RelativeLuminance(color)).To(BeNumerically("~", 0.0024, 0.001)) // Verifying correct gamma adjustment for small values
		})

		It("should handle gamma adjustment for very high values", func() {
			color := colorful.Color{R: 0.97, G: 0.97, B: 0.97}

			Expect(RelativeLuminance(color)).To(BeNumerically("~", 0.9331, 0.001)) // Verifying correct gamma adjustment for high values
		})
	})
})
