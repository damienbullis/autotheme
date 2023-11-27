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
		case tea.KeyEnter, tea.KeyCtrlC, tea.KeyEsc:
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

func initialModel() colorModel {
	ti := textinput.New()
	ti.Placeholder = "(press enter to use a random color)"
	ti.Focus()
	return colorModel{
		textInput: ti,
		err:       nil,
	}
}

func ColorPrompt() (string, error) {
	p := tea.NewProgram(initialModel())

	m, err := p.Run()
	if err != nil {
		utils.Log.Error("Error running prompt: %s", err)
		os.Exit(1)
	}

	if m, ok := m.(colorModel); ok {
		if m.textInput.Value() == "" {
			for i := 0; i < 6; i++ {
				fmt.Printf("\033[2K\033[1A")
			}

			return getColor()
		}
		color := m.textInput.Value()
		if err := config.CheckColorFlag(color); err != nil {
			return "", err
		}
		return color, nil
	} else {
		return getColor()
	}
}

func getColor() (string, error) {
	color := utils.GetRandomColor()
	cstr, _ := colorful.Hex(color)

	// Prompt user to confirm random color
	utils.Log.Info(
		"Use %s? %s ",
		utils.Str(color, &cstr, nil),
		utils.FgStr("grey", "(y/n)"),
	)
	var confirm string

	_, err := fmt.Scanln(&confirm)
	if err != nil && err.Error() != "unexpected newline" {
		utils.Log.Error("Error reading input: %s", err)
		os.Exit(1)
	}
	if confirm == "y" || confirm == "Y" || confirm == "yes" || confirm == "" {
		return color, nil
	}
	if confirm == "n" || confirm == "N" || confirm == "no" {
		fmt.Printf("\033[2K\033[1A\r")

		return getColor()
	}
	return "", errors.New("exit")
}
