#!/bin/bash

# Name of your Go program
APP_NAME="autotheme"

# Output directory
OUTPUT_DIR="dist"
mkdir -p $OUTPUT_DIR

# List of GOOS/GOARCH combinations for major operating systems and architectures
PLATFORMS=(
    "windows/amd64"
    "windows/386"
    "windows/arm64"
    "linux/amd64"
    "linux/386"
    "linux/arm"
    "linux/arm64"
    "darwin/amd64"  # macOS (Intel)
    "darwin/arm64"  # macOS (Apple Silicon)
    "freebsd/amd64"
    "freebsd/386"
)

for platform in "${PLATFORMS[@]}"
do
    # Split the platform string into GOOS and GOARCH
    IFS="/" read -r GOOS GOARCH <<< "$platform"
    
    # Set the output file name
    output_name="${APP_NAME}-${GOOS}-${GOARCH}"
    
    # Add .exe extension for Windows binaries
    if [ "$GOOS" = "windows" ]; then
        output_name+='.exe'
    fi
    
    # Build the binary
    echo "Building for $GOOS/$GOARCH..."
    env GOOS=$GOOS GOARCH=$GOARCH go build -o $OUTPUT_DIR/$output_name
    
    # Check if the build succeeded
    if [ $? -ne 0 ]; then
        echo "Error occurred during build for $GOOS/$GOARCH. Aborting."
        exit 1
    fi
done

echo "All builds completed successfully!"