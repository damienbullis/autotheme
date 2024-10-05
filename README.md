# AutoTheme

![License]()
![Version]()
![Build]()
![Coverage]()
![Release]()

> A _`zero-config`_ & _`zero-dependency`_ tool for generating accessible CSS themes using color theory.

## Contents

-   [Install](#install)
-   [Usage](#usage)
-   [Configuring](#configuring)
-   [CLI](#cli)
-   [Roadmap](#roapmap)

## Install

To install AutoTheme, you can use the following methods:

### Manual

For Linux/macOS (or Windows using Git Bash/WSL):

```base
curl -sL https://raw.githubusercontent.com/username/repo/main/install.sh | bash
```

For Windows (PowerShell):

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/username/repo/main/install.ps1" -OutFile "install.ps1"; ./install.ps1
```

### Go

```bash

```

### NPM

```bash

```

<br>

## Usage

Depending on your use case, you may only need to generate a theme once, and not need to change things. In this case, just run AutoTheme through your terminal and call it a day.

In other cases you may want AutoTheme to be apart of a build step.

### No Dependency Usage

After installing, you can just run

```bash
autotheme
```

#### Thats it!

Now if you _want_ to go customize further, AutoTheme does provide some cli flags.
Run `--help` for options.

to go through an interactive prompt where you can also provide some customization.

<br>

### Dev Dependency Usage

_finish_

<br>

## Configuration

You can either use a config file or pass in flags to the CLI.

### Flags

For more information on the available flags, run:

```bash
autotheme --help
```

Or see the [Config](#config) section for more information.

<br>

### Config File

Create a `autotheme.yml` file in the root of your project.

```bash
autotheme init
```

Skip the interactive prompt and use the default values.

```bash
autotheme init -y
```

<br>

#### `config`

TODO

<br>

#### `output`

TODO

<br>

#### `entrypoint`

TODO

<br>

#### `darkmode`

TODO

See the [Darkmode](#dark-mode) section for more information.

<br>

# TODO: Finish config section

<br>

## Dark Mode

Since there are a variety of setups for using dark mode, AutoTheme mostly provides the CSS variable framework. To finish integrating support for `prefers-color-scheme: dark`, there are a couple more steps.

<br>

1. On page load, so generally speaking your `index.html` should initialize dark-mode to prevent flashing unstyled content [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content)

    - You can either inline the script tag directly

    ```html
    <script>
    	const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    	if (localStorage.getItem("darkMode") === "true" || darkMode.matches) {
    		document.documentElement.classList.add("at-dark");
    	}

    	// If the user's system changes the preferred color scheme
    	darkMode.addEventListener("change", (e) => {
    		if (e.matches) {
    			document.documentElement.classList.add("at-dark");
    		} else {
    			document.documentElement.classList.remove("at-dark");
    		}
    	});
    </script>
    ```

    - or load it as an external file `/darkmode.js` instead

    ```html
    <script src="/darkmode.js"></script>
    ```

    ```js
    // darkmode.js

    /**
     * Init Darkmode
     * - checks for dark mode preference
     * - applies `at-dark` class to the root element if dark mode is preferred
     * - handles OS color-scheme change events
     */
    function initializeDarkMode() {
    	const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    	if (localStorage.getItem("darkMode") === "true" || darkMode.matches) {
    		document.documentElement.classList.add("at-dark");
    	}

    	// This wont set the local storage on change, but it will update the class
    	darkMode.addEventListener("change", (e) => {
    		if (e.matches) {
    			document.documentElement.classList.add("at-dark");
    		} else {
    			document.documentElement.classList.remove("at-dark");
    		}
    	});
    }

    initializeDarkMode();
    ```

2. Setup your onClick handler

    ```js
    /**
     * Toggle Dark Mode
     * - applies `at-dark` class to the root element
     * - saves the state to local storage
     */
    function toggleDarkMode() {
    	const darkMode = document.documentElement.classList.toggle("at-dark");
    	localStorage.setItem("darkMode", darkMode.toString());
    }
    ```

<br>

Now your site is ready to support both `light` & `dark` color schemes based on user preferences! :tada:

<br>

## Roapmap

-   [ ] Core
    -   [ ] Add json schema for the config file
    -   [ ] Add Tests
-   [ ] Installers
    -   [x] bash cli install
    -   [ ] go install
    -   [ ] npm install
-   [ ] Plugins
    -   [ ] ~~Tailwind~~ I think this is just going to be integrated
    -   [ ] ~~Rollup/Vite~~ (On hold because of Rolldown announcement)
-   [x] Darkmode script snippet in README
-   [ ] index.html integration (entrypoint)
    -   [ ] include snippet in README
-   [ ] index.css integration (output)

<br>

---

---

---

<br>

## Development

### Setup

#### Clone repo

```bash
git clone https://github.com/damienbullis/autotheme.git
cd autotheme
```

#### Install dependencies

```bash
make install
```

<br>

### Local Dev

> See makefile for all available commands.

#### Basic usage

```bash
make run
```

#### Passing arguments

```bash
make run ARGS="--help"
```

<br>

### Testing

#### All tests

```bash
make test
```

#### Watch mode

```bash
make test-watch
```

<br>

## Releasing

Releases are created via the `Release` workflow.

To create a new release, manually trigger the release workflow by going to the actions tab in the repo and selecting the `Release` workflow.

Enter the new version number when prompted and the workflow will take care of the rest.

-   [ ] Add on tag push trigger to the release workflow.

### Tagging Commits

Start your commit message with one of the following prefixes if you want to tag your commits in the changelog:

-   `feat - <YOUR_MESSAGE>` for new features
-   `fix - <YOUR_MESSAGE>` for bug fixes
-   `chore - <YOUR_MESSAGE>` for basically everything else
