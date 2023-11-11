package core

import "fmt"

func PrintNoise(noise *string) {
	fmt.Println("\n» Noise:")
	fmt.Println()
	fmt.Println(*noise + "\n")
}
