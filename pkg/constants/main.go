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

func supportsEmoji() bool {
	termProgram := os.Getenv("TERM_PROGRAM")
	termEmulator := os.Getenv("TERM_EMULATOR")
	// Check if the terminal is likely to support emoji
	return termProgram == "Apple_Terminal" ||
		termProgram == "vscode" ||
		termEmulator == "tmux" ||
		termEmulator == "alacritty" ||
		termEmulator == "iterm"
}

type IconFallbackMap map[Icons]string

var fallbackMap = IconFallbackMap{
	IconCheck:     "[√]",
	IconCross:     "[x]",
	IconWarn:      "[!]",
	IconWait:      "[...]",
	IconWrench:    "",
	IconRocket:    "",
	IconFire:      "",
	IconStar:      "[*]",
	IconLightning: "[~]",
	IconSparkles:  "[*]",
	IconRainbow:   "[~]",
	IconPalette:   "",
	IconPackage:   "",
}

type Icons string

const (
	// ASCII
	IconCheck     Icons = "✔"
	IconCross     Icons = "✘"
	IconWarn      Icons = "⚠"
	IconLightning Icons = "⚡️"
	// Emoji
	IconWait     Icons = "⌛"
	IconWrench   Icons = "🔧"
	IconRocket   Icons = "🚀"
	IconFire     Icons = "🔥"
	IconStar     Icons = "🌟"
	IconSparkles Icons = "✨"
	IconRainbow  Icons = "🌈"
	IconPalette  Icons = "🎨"
	IconPackage  Icons = "📦"
)

func (i Icons) Str() string {
	if emojiSupported {
		return string(i)
	}
	return fallbackMap[i]
}

type Anims string

const (
	AnimDots     Anims = "⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓"
	AnimDots2    Anims = "⣾⣽⣻⢿⡿⣟⣯⣷"
	AnimBars     Anims = "▁▃▄▅▆▇█▇▆▅▄▃"
	AnimGradient Anims = "█▓▒░"
	AnimSquare   Anims = "◰◳◲◱"
	AnimCircle   Anims = "◴◷◶◵"
	AnimArc      Anims = "◜◝◞◟"
	AnimBounce   Anims = "⠁⠂⠄⠂"
)

type Stages string

const (
	StageInit  Stages = "INIT"
	StageBuild Stages = "BUILD"
	StageDone  Stages = "DONE"
)

type Colors map[string]colorful.Color

var (
	// Colors
	black   = colorful.Color{R: 0, G: 0, B: 0}
	white   = colorful.Color{R: 1, G: 1, B: 1}
	red     = colorful.Color{R: 1, G: 0, B: 0}
	green   = colorful.Color{R: 0, G: 1, B: 0}
	blue    = colorful.Color{R: 0, G: 0, B: 1}
	yellow  = colorful.Color{R: 1, G: 1, B: 0}
	cyan    = colorful.Color{R: 0, G: 1, B: 1}
	magenta = colorful.Color{R: 1, G: 0, B: 1}
	grey    = colorful.Color{R: 0.5, G: 0.5, B: 0.5}
	orange  = colorful.Color{R: 1, G: 0.5, B: 0}
	purple  = colorful.Color{R: 0.5, G: 0, B: 1}
	pink    = colorful.Color{R: 1, G: 0, B: 0.5}
	teal    = colorful.Color{R: 0, G: 0.5, B: 1}
	// ColorMap
	ColorMap = Colors{
		"black":   black,
		"white":   white,
		"red":     red,
		"green":   green,
		"blue":    blue,
		"yellow":  yellow,
		"cyan":    cyan,
		"magenta": magenta,
		"grey":    grey,
		"orange":  orange,
		"purple":  purple,
		"pink":    pink,
		"teal":    teal,
	}
)

func Tab(n int) string {
	return strings.Repeat("  ", n)
}
