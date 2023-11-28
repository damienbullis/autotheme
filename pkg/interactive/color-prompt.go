package interactive

import (
	"autotheme/pkg/config"
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"errors"
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type colorModel struct {
	textInput textinput.Model
	err       error
}

func (m colorModel) Init() tea.Cmd {
	return textinput.Blink
}

func (m colorModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.Type {
		case tea.KeyCtrlC, tea.KeyEsc:
			m.err = errors.New("exit")
			return m, tea.Quit
		case tea.KeyEnter:
			return m, tea.Quit
		}

	// We handle errors just like any other message
	case error:
		m.err = msg
		return m, nil
	}

	m.textInput, cmd = m.textInput.Update(msg)
	return m, cmd
}

func (m colorModel) View() string {
	s := "  Enter a color:\n\n"
	s += m.textInput.View() + "\n\n"
	s += utils.FgStr("grey", "  (esc to quit)") + "\n\n"

	if m.err != nil {
		s += utils.FgStr("red", fmt.Sprintf(
			"  %s %s",
			constants.IconCross.Str(),
			m.err,
		)) + "\n"
	}

	return s
}

func initialColorModel() colorModel {
	ti := textinput.New()
	ti.Placeholder = "(press enter to use a random color)"
	ti.Focus()
	return colorModel{
		textInput: ti,
		err:       nil,
	}
}

type confirmColorModel struct {
	textInput textinput.Model
	err       error
}

func initialConfirmColorModel() confirmColorModel {
	ti := textinput.New()
	ti.Placeholder = "(y/n)"
	ti.Focus()
	return confirmColorModel{
		textInput: ti,
		err:       nil,
	}
}

func ColorPrompt() (string, error) {
	p := tea.NewProgram(initialColorModel())

	m, err := p.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		os.Exit(1)
	}

	if m, ok := m.(colorModel); ok {
		if m.err != nil && m.err.Error() == "exit" {
			return "", errors.New("exit")
		}
		if m.textInput.Value() == "" {
			return "", errors.New("not implemented (add random color)")
		}
		color := m.textInput.Value()

		if err := config.CheckColorFlag(color); err != nil {
			return "", err
		}

		return color, nil
	}

	return "", errors.New("not implemented")
}
