package core

import "fmt"

func PrintScaling(spacing *[]float64) {
	fmt.Println("» Scaling:")
	fmt.Println()
	for i, space := range *spacing {
		fmt.Println(TAB + fmt.Sprintf("%d", i+1) + ": " + fmt.Sprintf("%f", space))
	}
	fmt.Println()
}
