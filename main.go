package main

import (
	"autotheme/cmd"
)

// Build information - these will be replaced by ldflags during build
var (
	version   = "DEV"
	commit    = "none"
	date      = "unknown"
	builtBy   = "unknown"
	treeState = "clean"
)

func main() {
	_ = version
	_ = commit
	_ = date
	_ = builtBy
	_ = treeState

	// Execute the root command
	cmd.Execute(version)
}
