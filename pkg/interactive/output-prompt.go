package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"errors"
	"fmt"

	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
)

type outputModel struct {
	textInput textinput.Model
	err       error
}

func (m outputModel) Init() tea.Cmd {
	return textinput.Blink
}

func (m outputModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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

func (m outputModel) View() string {
	s := fmt.Sprintf("\n  Where should %s put your generated files.\n\n", utils.FgStr("white", "AutoTheme"))
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

func initialOutputModel() outputModel {
	ti := textinput.New()
	ti.Placeholder = "(default: ./)"
	ti.Focus()
	return outputModel{
		textInput: ti,
		err:       nil,
	}
}

func OutputPrompt() (string, error) {
	p := tea.NewProgram(initialOutputModel())

	m, err := p.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		return "", err
	}

	if m, ok := m.(outputModel); ok {
		if m.textInput.Value() == "" {

			return OutputPrompt()
		} else {
			return m.textInput.Value(), nil
		}
	} else {
		return "", errors.New("exit")
	}

}
