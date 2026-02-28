# AutoTheme Installer for Windows
# Downloads the appropriate binary from GitHub releases.

$ErrorActionPreference = "Stop"

$AppName = "autotheme"
$Repo = "damienbullis/autotheme"
$GitHubApiUrl = "https://api.github.com/repos/$Repo/releases/latest"

# Detect architecture
$Arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
switch ($Arch) {
    "X64" { $ArchName = "x64" }
    default {
        Write-Error "Unsupported architecture: $Arch"
        exit 1
    }
}

$Binary = "$AppName-windows-$ArchName.exe"
Write-Host "Detected platform: windows $ArchName"

# Fetch latest release
Write-Host "Fetching the latest release..."
try {
    $Release = Invoke-RestMethod -Uri $GitHubApiUrl -Headers @{ "User-Agent" = "autotheme-installer" }
    $Tag = $Release.tag_name
} catch {
    Write-Error "Could not fetch the latest release from GitHub."
    exit 1
}

Write-Host "Latest release: $Tag"

# Download binary
$DownloadUrl = "https://github.com/$Repo/releases/download/$Tag/$Binary"
$TempFile = Join-Path $env:TEMP $Binary

Write-Host "Downloading $Binary..."
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempFile -UseBasicParsing
} catch {
    Write-Error "Failed to download the binary. Check that a release exists for your platform."
    exit 1
}

# Prompt for install directory
$DefaultDir = Join-Path $env:LOCALAPPDATA $AppName
Write-Host ""
Write-Host "Where would you like to install $AppName? (default: $DefaultDir)"
$InstallDir = Read-Host "Install directory"

if ([string]::IsNullOrWhiteSpace($InstallDir)) {
    $InstallDir = $DefaultDir
}

# Create directory if needed
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "Created $InstallDir"
}

# Install
$DestPath = Join-Path $InstallDir "$AppName.exe"
Move-Item -Path $TempFile -Destination $DestPath -Force
Write-Host "Installed $AppName to $DestPath"

# Add to PATH if not present
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    Write-Host "Adding $InstallDir to user PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    $env:Path = "$env:Path;$InstallDir"
    Write-Host "Added to PATH. Restart your terminal for changes to take effect."
} else {
    Write-Host "$InstallDir is already in PATH."
}

# Verify
Write-Host ""
try {
    & $DestPath --version
    Write-Host "$AppName installed successfully!"
} catch {
    Write-Host "Installation complete. Restart your terminal to use $AppName."
}
