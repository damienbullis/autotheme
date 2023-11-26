package utils

import (
	"fmt"
)

type Logger struct {
	Info  func(format string, v ...any)
	Warn  func(format string, v ...any)
	Error func(format string, v ...any)
}

var Log *Logger

func init() {
	Log = &Logger{
		Info: func(format string, v ...any) {
			fmt.Printf(format, v...)
		},
		Warn: func(format string, v ...any) {
			fmt.Printf(FgStr("grey", "[WARN] ")+format, v...)
		},
		Error: func(format string, v ...any) {
			fmt.Printf(FgStr("red", "[ERROR] ")+format, v...)
		},
	}
}
