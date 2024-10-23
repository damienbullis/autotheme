package interactive

import (
	"autotheme/pkg/utils"
	"errors"
	"fmt"
	"os"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

type tailwindModel struct {
	cursor int
	choice string
	err    error
}

func (m tailwindModel) Init() tea.Cmd {
	return nil
}

func (m tailwindModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q", "esc":
			m.err = errors.New("exit")
			return m, tea.Quit

		case "enter":
			// Send the choice on the channel and exit.
			m.choice = booleanOptions[m.cursor]
			return m, tea.Quit

		case "down", "j":
			m.cursor++
			if m.cursor >= len(booleanOptions) {
				m.cursor = 0
			}

		case "up", "k":
			m.cursor--
			if m.cursor < 0 {
				m.cursor = len(booleanOptions) - 1
			}
		}
	}

	return m, nil
}

func (m tailwindModel) View() string {
	s := strings.Builder{}
	harmonyStr := rst + "\n  Are you using Tailwind?\n\n" + rst
	s.WriteString(utils.FgStr("grey", harmonyStr))
	for i, choice := range booleanOptions {

		if m.cursor == i {
			if choice == "Yes" {
				s.WriteString(fmt.Sprintf("  %s\n", utils.FgStr("green", "● "+choice)))
			} else {
				s.WriteString(fmt.Sprintf("  %s\n", utils.FgStr("red", "● "+choice)))
			}
		} else {
			s.WriteString(utils.FgStr("grey", (fmt.Sprintf("  %s %s\n", "◌", choice))))
		}
	}
	s.WriteString("\n\n")

	return s.String()
}

func TailwindPrompt() (bool, error) {
	p := tea.NewProgram(tailwindModel{})

	// Run returns the model as a tea.Model.

	m, err := p.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		os.Exit(1)
	}

	// Assert the final tea.Model to our local model and print the choice.
	if m, ok := m.(tailwindModel); ok {
		if m.err != nil && m.err.Error() == "exit" {
			return false, errors.New("exit")
		}
		// fmt.Printf("\n---\nYou chose %s!\n", m.choice)
		if m.choice == "Yes" ||
			m.choice == "yes" ||
			m.choice == "y" ||
			m.choice == "Y" ||
			m.choice == "" {
			return true, nil
		} else {
			return false, nil
		}
	} else {
		return false, errors.New("exit")
	}
}
