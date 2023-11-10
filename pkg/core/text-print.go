package core

import "fmt"

func PrintText(text *[]float64) {
	fmt.Println("» Text:")
	fmt.Println()
	for i, t := range *text {
		fmt.Println(TAB + fmt.Sprintf("%d", i+1) + ": " + fmt.Sprintf("%f", t))
	}
	fmt.Println()
}
