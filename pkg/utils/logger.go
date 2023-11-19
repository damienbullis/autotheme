// logger.go
package utils

import (
	"io"
	"log"
	"os"

	"github.com/lucasb-eyer/go-colorful"
)

type MyLogger struct {
	fileLogger    *log.Logger
	consoleLogger *log.Logger
	silent        bool
}

func NewLogger(silent bool, logFile string) (*MyLogger, error) {
	stdOut := os.Stdout

	if silent {
		stdOut = nil
	}

	var fileWriter io.Writer
	if logFile != "" {
		file, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			return nil, err
		}
		fileWriter = io.Writer(file)
	} else {
		fileWriter = stdOut
	}

	return &MyLogger{
		fileLogger:    log.New(fileWriter, "[AutoTheme] ", log.LstdFlags),
		consoleLogger: log.New(stdOut, "", 0),
		silent:        silent,
	}, nil
}

// TODO: FINISH THIS
func (l *MyLogger) Debug(format string, v ...any) {
	l.fileLogger.Printf("[DEBUG] "+format, v...)
}

func (l *MyLogger) Info(format string, v ...any) {
	l.consoleLogger.Printf(Str("[INFO] "+format, &colorful.Color{R: 222, G: 32, B: 21}, nil), v...)
	l.fileLogger.Printf("[INFO] "+format, v...)
}

func (l *MyLogger) Warn(format string, v ...any) {
	l.fileLogger.Printf("[WARN] "+format, v...)
}

func (l *MyLogger) Error(format string, v ...any) {
	l.fileLogger.Printf("[ERROR] "+format, v...)
}

var Log *MyLogger
