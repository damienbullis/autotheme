package core

import "fmt"

func PrintGradients(gradients *[]string) {
	fmt.Printf("» Gradients:")
	if len(*gradients) != 0 {
		fmt.Printf(" (Disabled...)")
		fmt.Println()
		return
	}
	fmt.Println()
	fmt.Println()

	for _, gradient := range *gradients {
		fmt.Println(gradient)
	}
}
