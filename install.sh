#!/bin/bash
set -euo pipefail

# AutoTheme Installer
# https://github.com/damienbullis/autotheme
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/damienbullis/autotheme/main/install.sh | bash
#
# Options (via env vars or flags):
#   --version <tag>     Install specific version (default: latest)
#   --prefix <dir>      Install directory (default: auto-detected)
#   --uninstall         Remove autotheme
#   --no-verify         Skip checksum verification
#   --help              Show this help
#
# Environment variables:
#   AUTOTHEME_VERSION   Same as --version
#   AUTOTHEME_PREFIX    Same as --prefix
#   AUTOTHEME_NO_VERIFY Same as --no-verify (set to 1)

APP_NAME="autotheme"
REPO="damienbullis/autotheme"
GITHUB_API="https://api.github.com/repos/$REPO/releases"

# Colors (disabled when not a TTY)
if [ -t 1 ]; then
  BOLD='\033[1m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  RED='\033[0;31m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  BOLD='' GREEN='' YELLOW='' RED='' DIM='' RESET=''
fi

# --- Helpers ---

info()  { printf "${GREEN}info${RESET}  %s\n" "$1"; }
warn()  { printf "${YELLOW}warn${RESET}  %s\n" "$1"; }
error() { printf "${RED}error${RESET} %s\n" "$1" >&2; }
dim()   { printf "${DIM}%s${RESET}\n" "$1"; }

cleanup() {
  if [ -n "${TMPDIR_CREATED:-}" ] && [ -d "$TMPDIR_CREATED" ]; then
    rm -rf "$TMPDIR_CREATED"
  fi
}
trap cleanup EXIT

usage() {
  cat <<EOF
${BOLD}AutoTheme Installer${RESET}

Install or update AutoTheme CLI.

${BOLD}USAGE${RESET}
  curl -fsSL <install-url> | bash
  bash install.sh [OPTIONS]

${BOLD}OPTIONS${RESET}
  --version <tag>     Install specific version (e.g. 0.1.0, latest)
  --prefix <dir>      Install to this directory
  --uninstall         Remove installed binary
  --no-verify         Skip checksum verification
  --help              Show this help

${BOLD}ENVIRONMENT${RESET}
  AUTOTHEME_VERSION   Version to install (overridden by --version)
  AUTOTHEME_PREFIX    Install directory (overridden by --prefix)
  AUTOTHEME_NO_VERIFY Set to 1 to skip checksum verification

${BOLD}EXAMPLES${RESET}
  # Install latest
  curl -fsSL <install-url> | bash

  # Install specific version
  curl -fsSL <install-url> | bash -s -- --version 0.1.0

  # Install to custom directory, non-interactive
  AUTOTHEME_PREFIX=~/.local/bin bash install.sh

  # Uninstall
  bash install.sh --uninstall
EOF
}

# --- Parse arguments ---

VERSION="${AUTOTHEME_VERSION:-latest}"
PREFIX="${AUTOTHEME_PREFIX:-}"
UNINSTALL=0
VERIFY=1
[ "${AUTOTHEME_NO_VERIFY:-0}" = "1" ] && VERIFY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --version)  VERSION="$2"; shift 2 ;;
    --prefix)   PREFIX="$2"; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    --no-verify) VERIFY=0; shift ;;
    --help|-h)  usage; exit 0 ;;
    *)          error "Unknown option: $1"; usage; exit 1 ;;
  esac
done

# --- Platform detection ---

detect_platform() {
  local os arch

  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"

  case "$os" in
    darwin)  os="darwin" ;;
    linux)   os="linux" ;;
    mingw*|cygwin*|msys*) os="windows" ;;
    *)       error "Unsupported OS: $os"; exit 1 ;;
  esac

  case "$arch" in
    x86_64|amd64)    arch="x64" ;;
    aarch64|arm64)   arch="arm64" ;;
    *)               error "Unsupported architecture: $arch"; exit 1 ;;
  esac

  PLATFORM_OS="$os"
  PLATFORM_ARCH="$arch"
}

# --- Find best install directory ---

find_install_dir() {
  # If user specified, use that
  if [ -n "$PREFIX" ]; then
    echo "$PREFIX"
    return
  fi

  # Try common directories in order of preference
  local candidates=(
    "$HOME/.local/bin"
    "$HOME/bin"
    "$HOME/.bin"
    "/usr/local/bin"
  )

  for dir in "${candidates[@]}"; do
    if [ -d "$dir" ] && echo "$PATH" | tr ':' '\n' | grep -qx "$dir"; then
      echo "$dir"
      return
    fi
  done

  # If ~/.local/bin exists (even if not in PATH), prefer it
  if [ -d "$HOME/.local/bin" ]; then
    echo "$HOME/.local/bin"
    return
  fi

  # Create ~/.local/bin as the best default
  echo "$HOME/.local/bin"
}

# --- Check for existing package managers ---

check_package_managers() {
  if command -v bun > /dev/null 2>&1; then
    warn "Bun is installed. You could also install via: bun add -g $APP_NAME"
  elif command -v npm > /dev/null 2>&1; then
    warn "npm is installed. You could also install via: npm install -g $APP_NAME"
  fi
}

# --- Version resolution ---

resolve_version() {
  local version="$1"

  if [ "$version" = "latest" ]; then
    info "Fetching latest release..."
    local response
    response="$(curl -fsSL "$GITHUB_API/latest" 2>/dev/null)" || {
      error "Failed to fetch latest release from GitHub."
      error "Check your network connection or try specifying a version with --version."
      exit 1
    }
    version="$(echo "$response" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')"
    if [ -z "$version" ]; then
      error "Could not parse release version from GitHub API response."
      exit 1
    fi
  else
    # Ensure version has v prefix for tag matching
    case "$version" in
      v*) ;;
      *)  version="v$version" ;;
    esac
  fi

  echo "$version"
}

# --- Download and verify ---

download_binary() {
  local version="$1" os="$2" arch="$3" outfile="$4"

  local binary_name="${APP_NAME}-${os}-${arch}"
  [ "$os" = "windows" ] && binary_name="${binary_name}.exe"

  local url="https://github.com/$REPO/releases/download/${version}/${binary_name}"

  info "Downloading $APP_NAME $version for $os/$arch..."
  dim "  $url"

  local http_code
  http_code="$(curl -fsSL -w '%{http_code}' -o "$outfile" "$url" 2>/dev/null)" || {
    error "Download failed (HTTP $http_code)."
    error "Binary may not exist for your platform ($os/$arch) at version $version."
    error "Available platforms: darwin-arm64, darwin-x64, linux-x64, linux-arm64, windows-x64"
    exit 1
  }
}

verify_checksum() {
  local version="$1" binary_file="$2" binary_name="$3"

  if [ "$VERIFY" -eq 0 ]; then
    dim "  Skipping checksum verification (--no-verify)"
    return 0
  fi

  local checksums_url="https://github.com/$REPO/releases/download/${version}/checksums.txt"
  local checksums_file
  checksums_file="$(mktemp)"

  if ! curl -fsSL -o "$checksums_file" "$checksums_url" 2>/dev/null; then
    warn "No checksums.txt found for this release. Skipping verification."
    rm -f "$checksums_file"
    return 0
  fi

  local expected
  expected="$(grep "$binary_name" "$checksums_file" | awk '{print $1}')"
  rm -f "$checksums_file"

  if [ -z "$expected" ]; then
    warn "No checksum found for $binary_name. Skipping verification."
    return 0
  fi

  local actual
  if command -v sha256sum > /dev/null 2>&1; then
    actual="$(sha256sum "$binary_file" | awk '{print $1}')"
  elif command -v shasum > /dev/null 2>&1; then
    actual="$(shasum -a 256 "$binary_file" | awk '{print $1}')"
  else
    warn "Neither sha256sum nor shasum found. Skipping checksum verification."
    return 0
  fi

  if [ "$actual" != "$expected" ]; then
    error "Checksum verification failed!"
    error "  Expected: $expected"
    error "  Actual:   $actual"
    error "The download may be corrupted. Try again or use --no-verify."
    exit 1
  fi

  info "Checksum verified."
}

# --- Install ---

install_binary() {
  local source="$1" install_dir="$2"

  # Create directory if needed
  if [ ! -d "$install_dir" ]; then
    info "Creating $install_dir..."
    if mkdir -p "$install_dir" 2>/dev/null; then
      true
    elif sudo mkdir -p "$install_dir"; then
      true
    else
      error "Failed to create $install_dir. Check permissions."
      exit 1
    fi
  fi

  local dest="$install_dir/$APP_NAME"

  # Check for existing installation
  if [ -f "$dest" ]; then
    local existing_version
    existing_version="$("$dest" --version 2>/dev/null || echo "unknown")"
    info "Upgrading $APP_NAME ($existing_version -> $RESOLVED_VERSION)..."
  fi

  # Install with appropriate permissions
  if [ -w "$install_dir" ]; then
    mv "$source" "$dest"
    chmod +x "$dest"
  else
    info "Elevated permissions required for $install_dir."
    sudo mv "$source" "$dest"
    sudo chmod +x "$dest"
  fi
}

verify_installation() {
  local install_dir="$1"
  local dest="$install_dir/$APP_NAME"

  if ! [ -x "$dest" ]; then
    error "Installation failed: $dest is not executable."
    exit 1
  fi

  # Check if install dir is in PATH
  if ! echo "$PATH" | tr ':' '\n' | grep -qx "$install_dir"; then
    echo ""
    warn "$install_dir is not in your PATH."
    echo ""
    local shell_name
    shell_name="$(basename "$SHELL" 2>/dev/null || echo "bash")"
    local rc_file
    case "$shell_name" in
      zsh)  rc_file="$HOME/.zshrc" ;;
      fish) rc_file="$HOME/.config/fish/config.fish" ;;
      *)    rc_file="$HOME/.bashrc" ;;
    esac

    echo "  Add it to your PATH by running:"
    echo ""
    if [ "$shell_name" = "fish" ]; then
      echo "    fish_add_path $install_dir"
    else
      echo "    echo 'export PATH=\"$install_dir:\$PATH\"' >> $rc_file"
    fi
    echo ""
    echo "  Then restart your shell or run:"
    echo ""
    echo "    export PATH=\"$install_dir:\$PATH\""
    echo ""
  fi

  info "$APP_NAME $RESOLVED_VERSION installed to $dest"

  if command -v "$APP_NAME" > /dev/null 2>&1; then
    dim "  $($APP_NAME --version 2>/dev/null || true)"
  fi
}

# --- Uninstall ---

do_uninstall() {
  local found=0

  # Search common locations
  local locations=(
    "$HOME/.local/bin/$APP_NAME"
    "$HOME/bin/$APP_NAME"
    "$HOME/.bin/$APP_NAME"
    "/usr/local/bin/$APP_NAME"
  )

  # Also check PREFIX if specified
  [ -n "$PREFIX" ] && locations=("$PREFIX/$APP_NAME" "${locations[@]}")

  # Also check which
  local which_path
  which_path="$(command -v "$APP_NAME" 2>/dev/null || true)"
  [ -n "$which_path" ] && locations=("$which_path" "${locations[@]}")

  for loc in "${locations[@]}"; do
    if [ -f "$loc" ]; then
      info "Found $APP_NAME at $loc"
      if [ -w "$(dirname "$loc")" ]; then
        rm "$loc"
      else
        sudo rm "$loc"
      fi
      info "Removed $loc"
      found=1
      break
    fi
  done

  if [ "$found" -eq 0 ]; then
    error "$APP_NAME not found. Nothing to uninstall."
    exit 1
  fi

  info "$APP_NAME uninstalled successfully."
}

# --- Main ---

main() {
  echo ""
  printf "${BOLD}AutoTheme Installer${RESET}\n"
  echo ""

  # Handle uninstall
  if [ "$UNINSTALL" -eq 1 ]; then
    do_uninstall
    return
  fi

  # Detect platform
  detect_platform
  info "Detected platform: $PLATFORM_OS/$PLATFORM_ARCH"

  # Suggest package manager alternatives
  check_package_managers

  # Resolve version
  RESOLVED_VERSION="$(resolve_version "$VERSION")"
  info "Version: $RESOLVED_VERSION"

  # Create temp directory for download
  TMPDIR_CREATED="$(mktemp -d)"

  local binary_name="${APP_NAME}-${PLATFORM_OS}-${PLATFORM_ARCH}"
  [ "$PLATFORM_OS" = "windows" ] && binary_name="${binary_name}.exe"
  local tmpfile="$TMPDIR_CREATED/$binary_name"

  # Download
  download_binary "$RESOLVED_VERSION" "$PLATFORM_OS" "$PLATFORM_ARCH" "$tmpfile"

  # Verify checksum
  verify_checksum "$RESOLVED_VERSION" "$tmpfile" "$binary_name"

  # Make executable
  chmod +x "$tmpfile"

  # Determine install directory
  local install_dir
  install_dir="$(find_install_dir)"

  # Interactive confirmation if TTY and no explicit prefix
  if [ -t 0 ] && [ -z "$PREFIX" ]; then
    echo ""
    printf "  Install to ${BOLD}%s${RESET}? [Y/n/path] " "$install_dir"
    read -r reply
    case "$reply" in
      ""|[Yy]|[Yy]es) ;;
      [Nn]|[Nn]o) info "Installation cancelled."; exit 0 ;;
      *) install_dir="$reply" ;;
    esac
  fi

  # Install
  install_binary "$tmpfile" "$install_dir"

  # Verify
  verify_installation "$install_dir"

  echo ""
}

main
