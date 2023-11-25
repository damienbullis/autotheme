package config

import (
	h "autotheme/pkg/core/harmony"
	"errors"
	"unicode/utf8"
)

func CheckColorFlag(c string) error {
	len := utf8.RuneCountInString(c)
	if (len != 7 && len != 4) || c[0] != '#' {
		return errors.New("color flag is invalid... please provide a valid hex code (e.g. #000000 or #000)")
	}
	return nil
}

func CheckHarmonyFlag(harmony string) error {
	// check if harmony flag is valid
	if harmony != h.Complementary &&
		harmony != h.Analogous &&
		harmony != h.Triadic &&
		harmony != h.Tetradic &&
		harmony != h.SplitComplementary &&
		harmony != h.Rectangle &&
		harmony != h.Square &&
		harmony != h.BiPolar &&
		harmony != h.Aurelian &&
		harmony != h.LunarEclipse &&
		harmony != h.Retrograde {
		return errors.New("harmony flag is invalid")
	}
	return nil
}
