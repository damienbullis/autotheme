package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/core/harmony"
	"autotheme/pkg/utils"
	"errors"
	"fmt"
	"math/rand"
	"os"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

type harmonyModel struct {
	cursor  int
	choice  string
	options []string
}

func (m harmonyModel) Init() tea.Cmd {
	return nil
}

func (m harmonyModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q", "esc":
			return m, tea.Quit

		case "enter":
			// Send the choice on the channel and exit.
			m.choice = m.options[m.cursor]
			return m, tea.Quit

		case "down", "j":
			m.cursor++
			if m.cursor >= len(m.options) {
				m.cursor = 0
			}

		case "up", "k":
			m.cursor--
			if m.cursor < 0 {
				m.cursor = len(m.options) - 1
			}
		}
	}

	return m, nil
}

func randomIcon(currentIndex *int) string {
	icons := []string{
		constants.IconRocket.Str(),
		constants.IconParty.Str(),
		constants.IconFire.Str(),
		constants.IconStar.Str(),
		constants.IconSparkles.Str(),
		constants.IconRainbow.Str(),
		constants.IconPalette.Str(),
		constants.IconPackage.Str(),
	}
	if currentIndex != nil {
		check := *currentIndex % len(icons)

		return icons[check]
	}
	index := rand.Intn(len(icons))
	return icons[index]
}

func (m harmonyModel) View() string {
	s := strings.Builder{}
	s.WriteString("\nSelect a harmony\n")
	s.WriteString(utils.FgStr("grey", "(use ⬆/⬇ to navigate, enter to select)\n\n"))

	for i := 0; i < len(m.options); i++ {
		if m.cursor == i {
			s.WriteString(fmt.Sprintf("%s %s\n", randomIcon(&i), m.options[i]))
		} else {
			s.WriteString(utils.FgStr("grey", m.options[i]+"\n"))
		}
	}
	s.WriteString(utils.FgStr("grey", "\n(press q to quit)\n"))

	return s.String()
}

// TODO: Harmony needs to handle empty input = random
func HarmonyPrompt() (string, error) {
	options := []string{
		"random",
	}
	options = append(options, harmony.HarmonyTypes...)
	p := tea.NewProgram(harmonyModel{
		options: options,
	})

	m, err := p.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		os.Exit(1)
	}

	if m, ok := m.(harmonyModel); ok && m.choice != "" {
		if m.choice == "random" {
			return harmony.GetRandomHarmony(), nil
		}
		return m.choice, nil
	} else {
		return "", errors.New("exit")
	}
}
