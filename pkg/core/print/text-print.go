package print

import (
	"autotheme/pkg/core"
	"fmt"
)

func PrintText(text *[]float64) {
	fmt.Println("» Text:")
	fmt.Println()
	for i, t := range *text {
		fmt.Println(core.TAB + fmt.Sprintf("%d", i+1) + ": " + fmt.Sprintf("%f", t))
	}
	fmt.Println()
}
