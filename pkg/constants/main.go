package constants

import (
	"os"

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
	IconCog:       "",
	IconRocket:    "",
	IconFire:      "",
	IconStar:      "[*]",
	IconArrow:     "[->]",
	IconLight:     "[ ]",
	IconDark:      "[■]",
	IconLightning: "[~]",
	IconRecycle:   "[♻]",
	IconSparkles:  "[*]",
	IconRainbow:   "[~]",
	IconDNA:       "",
	IconPalette:   "",
}

type Icons string

const (
	// Icons
	IconCheck     Icons = "✔"
	IconCross     Icons = "✘"
	IconWarn      Icons = "⚠"
	IconWait      Icons = "⌛"
	IconWrench    Icons = "🔧"
	IconCog       Icons = "⚙"
	IconRocket    Icons = "🚀"
	IconFire      Icons = "🔥"
	IconStar      Icons = "★"
	IconArrow     Icons = "➤"
	IconLight     Icons = "⚪️"
	IconDark      Icons = "⚫️"
	IconLightning Icons = "⚡️"
	IconRecycle   Icons = "♻️"
	IconSparkles  Icons = "✨"
	IconRainbow   Icons = "🌈"
	IconDNA       Icons = "🧬"
	IconPalette   Icons = "🎨"
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
	gray    = colorful.Color{R: 0.5, G: 0.5, B: 0.5}
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
		"gray":    gray,
		"orange":  orange,
		"purple":  purple,
		"pink":    pink,
		"teal":    teal,
	}
)
