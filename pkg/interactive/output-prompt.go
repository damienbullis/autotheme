package interactive

import (
	"autotheme/pkg/constants"
	"autotheme/pkg/utils"
	"errors"
	"fmt"
	"os"
	"path/filepath"

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

func checkOutput(path string) error {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	fullfile := filepath.Join(absPath, "autotheme.css")
	// recursively create directories if they don't exist
	if err := os.MkdirAll(absPath, os.ModePerm); err != nil {
		return err
	}

	// create file
	file, err := os.Create(fullfile)
	if err != nil {
		return err
	}

	defer file.Close()

	if err := os.Remove(fullfile); err != nil {
		return err
	}

	return nil
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
			if m.textInput.Value() == "" {
				m.textInput.SetValue("./")
			}

			if err := checkOutput(m.textInput.Value()); err != nil {
				m.err = err
				return m, nil
			}

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
		if m.err != nil && m.err.Error() == "exit" {
			return "", errors.New("exit")
		}

		return m.textInput.Value(), nil
	} else {
		return "", errors.New("exit")
	}

}
