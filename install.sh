#!/bin/bash

# Name of your application
APP_NAME="autotheme"
REPO="username/repo" # TODO: Replace with your GitHub username and repository

# GitHub API URL for releases
GITHUB_API_URL="https://api.github.com/repos/$REPO/releases/latest"
GITHUB_DOWNLOAD_URL="https://github.com/$REPO/releases/download"

# Function to print the user's current PATH directories
print_user_path() {
    echo "Your current PATH directories are:"
    echo "$PATH" | tr ':' '\n'
}

# Prompt the user for the installation directory
echo "Please enter the directory where you'd like to install $APP_NAME (default: /usr/local/bin):"
echo ""
echo "Hint: Choose a directory from your \$PATH for easy access to the program from anywhere."
print_user_path
echo ""
read -r INSTALL_DIR

# Detect the platform (OS and architecture)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Adjust architecture names to match Go's naming conventions
case "$ARCH" in
    x86_64)
        ARCH="amd64"
        ;;
    i386)
        ARCH="386"
        ;;
    armv7l)
        ARCH="arm"
        ;;
    aarch64)
        ARCH="arm64"
        ;;
esac

# Adjust OS names to match Go's naming conventions
case "$OS" in
    darwin)
        OS="darwin"
        ;;
    linux)
        OS="linux"
        ;;
    mingw*|cygwin*|msys*|windowsnt)
        OS="windows"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

# Binary file name (based on OS and architecture)
BINARY="${APP_NAME}-${OS}-${ARCH}"

# Add .exe for Windows
if [ "$OS" = "windows" ]; then
    BINARY="${BINARY}.exe"
fi

# TODO: TESTING
echo "Detected platform: $OS $ARCH"
echo "Binary file: $BINARY"
exit 0
# TODO: REMOVE

# Get the latest release version from GitHub API
echo "Fetching the latest release information..."
LATEST_RELEASE=$(curl -s $GITHUB_API_URL | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
if [ -z "$LATEST_RELEASE" ]; then
    echo "Error fetching the latest release from GitHub."
    exit 1
fi

# Download the binary for the detected OS and architecture
BINARY_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_RELEASE}/${BINARY}"
echo "Downloading $BINARY from $BINARY_URL..."
curl -L -o "$BINARY" "$BINARY_URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Failed to download the binary."
    exit 1
fi

# Make the binary executable
chmod +x "$BINARY"

# Prompt the user for the installation directory
echo "Please enter the directory where you'd like to install $APP_NAME (default: /usr/local/bin):"
read -r INSTALL_DIR

# Set default install directory if none provided
if [ -z "$INSTALL_DIR" ]; then
    INSTALL_DIR="/usr/local/bin"
fi

# Ensure the installation directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Directory $INSTALL_DIR does not exist. Creating it now..."
    sudo mkdir -p "$INSTALL_DIR"
fi

# Move the binary to the installation directory
echo "Installing $BINARY to $INSTALL_DIR..."
sudo mv "$BINARY" "$INSTALL_DIR/$APP_NAME"

# Ensure the binary is executable
sudo chmod +x "$INSTALL_DIR/$APP_NAME"

# Verify the installation
if command -v "$APP_NAME" > /dev/null; then
    echo "$APP_NAME installed successfully!"
    "$APP_NAME" --version
else
    echo "Installation failed."
    exit 1
fi