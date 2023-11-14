package print

import (
	"fmt"

	"github.com/lucasb-eyer/go-colorful"
)

func PrintGradients(gradients [][]colorful.Color) {
	fmt.Printf("» Gradients:")
	if len(gradients) == 0 {
		fmt.Printf(" (Disabled...)")
		fmt.Println()
		return
	}
	fmt.Println()
	fmt.Println()

	for _, gradient := range gradients {
		for i, color := range gradient {
			fmt.Print(color.Hex())
			if i < len(gradient)-1 {
				fmt.Printf(" -> ")
			}
			if i == len(gradient)-1 {
				fmt.Print("\n")
			}
		}
	}
}
