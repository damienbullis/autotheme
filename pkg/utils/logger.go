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

func NewLogger(silent bool, logFile interface{}) (*MyLogger, error) {
	stdOut := os.Stdout

	if silent {
		stdOut = nil
	}

	var fileWriter io.Writer

	// if log wasnt provided, use nothing for fileWriter
	if logFile == nil {
		fileWriter = nil
	} else {
		if logFile := logFile.(string); logFile != "" {
			// if log was provided, use it as a file path
			file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			if err != nil {
				return nil, err
			}
			fileWriter = file
		} else {
			// if log was provided but is empty, use stdout
			fileWriter = stdOut
		}

	}

	results := &MyLogger{
		fileLogger:    nil,
		consoleLogger: log.New(stdOut, "", 0),
		silent:        silent,
	}

	if fileWriter != nil {
		results.fileLogger = log.New(fileWriter, "[AutoTheme] ", log.LstdFlags)
	}

	return results, nil

}

// TODO: FINISH THIS
func (l *MyLogger) Debug(format string, v ...any) {
	if l.fileLogger != nil {
		l.fileLogger.Printf("[DEBUG] "+format, v...)
	}
}

func (l *MyLogger) Info(format string, v ...any) {
	l.consoleLogger.Printf(Str("[INFO] "+format, &colorful.Color{R: 222, G: 32, B: 21}, nil), v...)
	if l.fileLogger != nil {
		l.fileLogger.Printf("[INFO] "+format, v...)
	}
}

func (l *MyLogger) Warn(format string, v ...any) {
	l.consoleLogger.Printf(Str("[WARN] "+format, &colorful.Color{R: 255, G: 165, B: 0}, nil), v...)
	if l.fileLogger != nil {
		l.fileLogger.Printf("[WARN] "+format, v...)
	}
}

func (l *MyLogger) Error(format string, v ...any) {
	l.consoleLogger.Printf(Str("[ERROR] "+format, &colorful.Color{R: 255, G: 0, B: 0}, nil), v...)
	if l.fileLogger != nil {
		l.fileLogger.Printf("[ERROR] "+format, v...)
	}
}

var Log *MyLogger
