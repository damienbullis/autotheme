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
	"github.com/lucasb-eyer/go-colorful"
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
	color     string
	textInput textinput.Model
	err       error
}

func initialConfirmColorModel() confirmColorModel {
	ti := textinput.New()
	ti.Placeholder = "(y/n)"
	ti.Focus()
	return confirmColorModel{
		color:     utils.GetRandomColor(),
		textInput: ti,
		err:       nil,
	}
}

func (m confirmColorModel) Init() tea.Cmd {
	return textinput.Blink
}

func (m confirmColorModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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

func (m confirmColorModel) View() string {
	c, _ := colorful.Hex(m.color)

	s := "  Use this color? " + utils.Str(m.color, &c, nil) + "\n\n"
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

func colorConfirmPrompt() (string, error) {
	confirm := tea.NewProgram(initialConfirmColorModel())

	m, err := confirm.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		os.Exit(1)
	}

	if m, ok := m.(confirmColorModel); ok {
		if m.err != nil && m.err.Error() == "exit" {
			return "", errors.New("exit")
		}

		confirm := m.textInput.Value()

		if confirm == "y" || confirm == "Y" || confirm == "yes" || confirm == "" {
			return m.color, nil
		} else {
			return "", errors.New("exit")
		}
	}

	return "", errors.New("should not be here")
}

func clearLinesAndMoveCursor(lines int) {
	for i := 0; i < lines; i++ {
		fmt.Print("\033[A")
		fmt.Print("\033[2K")
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
		// If user pressed enter, use a random color
		if m.textInput.Value() == "" {
			clearLinesAndMoveCursor(6)
			return colorConfirmPrompt()
		}
		color := m.textInput.Value()

		if err := config.CheckColorFlag(color); err != nil {
			return "", err
		}

		// Success
		return color, nil
	}

	return "", errors.New("should not be here")
}
