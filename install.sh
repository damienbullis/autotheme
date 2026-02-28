#!/bin/bash

# AutoTheme Installer
# Detects your system and downloads the appropriate binary.

APP_NAME="autotheme"
REPO="damienbullis/autotheme"

GITHUB_API_URL="https://api.github.com/repos/$REPO/releases/latest"
GITHUB_DOWNLOAD_URL="https://github.com/$REPO/releases/download"

# Detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names to Bun conventions
case "$ARCH" in
    x86_64)
        ARCH="x64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

# Normalize OS names
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

# Build binary name
BINARY="${APP_NAME}-${OS}-${ARCH}"

if [ "$OS" = "windows" ]; then
    BINARY="${BINARY}.exe"
fi

echo "Detected platform: $OS $ARCH"

# Get the latest release version from GitHub API
echo "Fetching the latest release..."
LATEST_RELEASE=$(curl -s "$GITHUB_API_URL" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
if [ -z "$LATEST_RELEASE" ]; then
    echo "Error: Could not fetch the latest release from GitHub."
    exit 1
fi

echo "Latest release: $LATEST_RELEASE"

# Download the binary
BINARY_URL="${GITHUB_DOWNLOAD_URL}/${LATEST_RELEASE}/${BINARY}"
echo "Downloading $BINARY..."
curl -fSL -o "$BINARY" "$BINARY_URL"

if [ $? -ne 0 ]; then
    echo "Failed to download the binary. Check that a release exists for your platform."
    exit 1
fi

# Make the binary executable
chmod +x "$BINARY"

# Prompt for install directory
echo ""
echo "Where would you like to install $APP_NAME? (default: /usr/local/bin)"
echo ""
echo "Your current PATH directories:"
echo "$PATH" | tr ':' '\n'
echo ""
read -r INSTALL_DIR

if [ -z "$INSTALL_DIR" ]; then
    INSTALL_DIR="/usr/local/bin"
fi

# Ensure the directory exists
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Creating $INSTALL_DIR..."
    sudo mkdir -p "$INSTALL_DIR"
fi

# Install
echo "Installing $APP_NAME to $INSTALL_DIR..."
sudo mv "$BINARY" "$INSTALL_DIR/$APP_NAME"
sudo chmod +x "$INSTALL_DIR/$APP_NAME"

# Verify
if command -v "$APP_NAME" > /dev/null; then
    echo "$APP_NAME installed successfully!"
    "$APP_NAME" --version
else
    echo "Installation complete. You may need to restart your shell or add $INSTALL_DIR to your PATH."
fi
