package utils

import (
	"fmt"

	"github.com/spf13/viper"
)

type Logger struct {
	Info  func(format string, v ...any)
	Warn  func(format string, v ...any)
	Error func(format string, v ...any)
}

var Log *Logger

func SetLogger() {
	isSilent := viper.GetBool("silent")

	if isSilent {
		Log = &Logger{
			Info:  func(format string, v ...any) {},
			Warn:  func(format string, v ...any) {},
			Error: func(format string, v ...any) {},
		}
	}
}

func init() {
	Log = &Logger{
		Info: func(format string, v ...any) {
			fmt.Printf(format, v...)
		},
		Warn: func(format string, v ...any) {
			fmt.Printf(FgStr("yellow", "\n[WARN] ")+format, v...)
		},
		Error: func(format string, v ...any) {
			// Not sure if I should allow silent mode here to suppress errors
			fmt.Printf(FgStr("red", "\n[ERROR] ")+format+"\n", v...)
		},
	}
}
