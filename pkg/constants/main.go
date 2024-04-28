package constants

import (
	"os"
	"strings"

	"github.com/lucasb-eyer/go-colorful"
)

var emojiSupported bool

func init() {
	emojiSupported = supportsEmoji()
}

// TODO: Verify if this is good enough
func supportsEmoji() bool {
	termProgram := os.Getenv("TERM_PROGRAM")
	termEmulator := os.Getenv("TERM_EMULATOR")
	// Check if the terminal is likely to support emoji
	return termProgram == "Apple_Terminal" ||
		termProgram == "vscode" ||
		termEmulator == "tmux" ||
		termEmulator == "alacritty" ||
		termEmulator == "iterm" ||
		termProgram == "WarpTerminal"

}

type Icons string

const (
	// ASCII
	IconCheck     Icons = "✔"
	IconCross     Icons = "✘"
	IconWarn      Icons = "⚠"
	IconLightning Icons = "⚡️"
	// Emoji
	IconRocket   Icons = "🚀"
	IconParty    Icons = "🎉"
	IconFire     Icons = "🔥"
	IconStar     Icons = "🌟"
	IconSparkles Icons = "✨"
	IconRainbow  Icons = "🌈"
	IconPalette  Icons = "🎨"
	IconDevil    Icons = "😈"

	IconPackage Icons = "📦"
)

func (i Icons) Str() string {
	if emojiSupported {
		return string(i)
	}
	return ""
}

type Stages string

type Colors map[string]colorful.Color

var ColorMap = Colors{
	// Used
	"grey":   colorful.Color{R: 0.5, G: 0.5, B: 0.5},
	"yellow": colorful.Color{R: 1, G: 1, B: 0},
	"red":    colorful.Color{R: 1, G: 0.25, B: 0.25},
	// Unused
	"black":   colorful.Color{R: 0, G: 0, B: 0},
	"white":   colorful.Color{R: 1, G: 1, B: 1},
	"green":   colorful.Color{R: 0, G: 1, B: 0.5},
	"blue":    colorful.Color{R: 0, G: 0, B: 1},
	"cyan":    colorful.Color{R: 0, G: 1, B: 1},
	"magenta": colorful.Color{R: 1, G: 0, B: 1},
	"orange":  colorful.Color{R: 1, G: 0.5, B: 0},
	"purple":  colorful.Color{R: 0.5, G: 0, B: 1},
	"pink":    colorful.Color{R: 1, G: 0, B: 0.5},
	"teal":    colorful.Color{R: 0, G: 0.5, B: 1},
}

func Tab(n int) string {
	return strings.Repeat("  ", n)
}

// type Anims string

// const (
// 	AnimDots     Anims = "⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓"
// 	AnimDots2    Anims = "⣾⣽⣻⢿⡿⣟⣯⣷"
// 	AnimBars     Anims = "▁▃▄▅▆▇█▇▆▅▄▃"
// 	AnimGradient Anims = "█▓▒░"
// 	AnimSquare   Anims = "◰◳◲◱"
// 	AnimCircle   Anims = "◴◷◶◵"
// 	AnimArc      Anims = "◜◝◞◟"
// 	AnimBounce   Anims = "⠁⠂⠄⠂"
// )
