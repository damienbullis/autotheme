// logger.go
package utils

import (
	"fmt"
	"log"
	"os"

	"github.com/spf13/viper"
)

type Logger struct {
	consoleLogger *log.Logger
}

func (l *Logger) Info(format string, v ...any) {
	l.consoleLogger.Printf(format, v...)
}

func (l *Logger) Warn(format string, v ...any) {
	l.consoleLogger.Printf(FgStr("grey", "[WARN] ")+format, v...)
}

func (l *Logger) Error(format string, v ...any) {
	l.consoleLogger.Printf(FgStr("red", "[ERROR] ")+format, v...)
}

var Log *Logger

func init() {
	writer := os.Stdout
	if viper.GetBool("silent") {
		fmt.Printf("Silent mode enabled\n")
		writer = nil
	}
	Log = &Logger{
		consoleLogger: log.New(writer, "", 0),
	}
}
