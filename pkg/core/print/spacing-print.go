package print

import (
	"autotheme/pkg/core"
	"fmt"
)

func PrintSpacing(spacing *[]float64) {
	fmt.Println("» Spacing:")
	fmt.Println()
	for i, space := range *spacing {
		fmt.Println(core.TAB + fmt.Sprintf("%d", i+1) + ": " + fmt.Sprintf("%f", space))
	}
	fmt.Println()
}
