# AutoTheme

![License]()
![Version]()
![Build]()
![Coverage]()
![Release]()

> A _`zero-config`_ & _`zero-dependency`_ tool for generating accessible CSS themes using color theory.

<details>
<summary><b>Contents</b></summary>

-   [Install](#install)
-   [Usage](#usage)
-   [Configuring](#configuring)
-   [CLI](#cli)
-   [Roadmap](#roapmap)

</details>

<br>

# Install

To install AutoTheme, you can use the following methods:

<details>
<summary style="font-size:1.1em; font-weight:bold;">Manual</summary>

#### Automatic Install (Recommended)

> `install.sh` will detect your system and download the appropriate binary.

<details>
<summary>For Linux/macOS (or Windows using Git Bash/WSL):</summary>

```bash
curl -sL https://raw.githubusercontent.com/username/repo/main/install.sh | bash
```

</details>

<details>
<summary>For Windows (PowerShell):</summary>

```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/username/repo/main/install.ps1" -OutFile "install.ps1"; ./install.ps1
```

</details>

#### Manual Install

> Download the appropriate binary for your system from the [releases page](https://github.com/damienbullis/autotheme/releases).

</details>

<details>
<summary style="font-size:1.1em; font-weight:bold;">GO</summary>

```bash

```

</details>

<details>
<summary style="font-size:1.1em; font-weight:bold;">NPM</summary>

```bash

```

</details>

<br>

# Usage

```bash
autotheme
```

> Generates a `src/index.css` to the current directory.

AutoTheme will choose a random color and harmony for if none is provided.

```bash
autotheme --color="#FF0000" --harmony="analogous"
```

### Add AutoTheme to your project

<details>
<summary style="font-size:1.1em; font-weight:bold; margin-bottom: .5em;">Using HTML</summary>

> Include the generated CSS file in your HTML.

```html
<link rel="stylesheet" href="./src/index.css" />
```

</details>

<details>
<summary style="font-size:1.1em; font-weight:bold; margin-bottom: .5em;">Using A Framework</summary>

> If you are using a framework like React, Vue, or Angular, you can include the CSS file in your main component.

```js
import "./src/index.css";
```

</details>

### Keeping your theme consistent

If you are planning on changing your theme often, or just want to make sure your theme stays up-to-date with any changes you make, you can add AutoTheme to your build process.

<details>
<summary style="font-weight:bold; margin-bottom: .5em;">Manually add step to your build process.</summary>

Could be as simple as adding

```bash
&& autotheme <ARGS>
```

</details>

<details>
<summary style="font-weight:bold; margin-bottom: .5em;">If you are using Vite.</summary>

See [AutoTheme Vite Plugin]() for more information.

##### TODO: Command to generate the plugin

</details>

</details>

## Configuration

AutoTheme can be configured using:

-   By passing flags to the CLI.
-   A `autotheme.yml` config file.

### `init` Command

```bash
# Interactive prompt
autotheme init

# Skip the interactive prompt
autotheme init -y
```

> By default `init` will create a `autotheme.yml` in the current directory.

<details>
<summary style="margin-bottom: 1em;">See Default Config</summary>

```yml
# autotheme.yml

color: "#FF0000"
harmony: "analogous"
scalar: 1.618
# Finish this section
```

</details>

<details>
<summary style="margin-bottom: 1em">CLI Flags</summary>

| Long        | Short | Type      | Description                                                            |
| ----------- | ----- | --------- | ---------------------------------------------------------------------- |
| `--color`   | `-c`  | `string`  | The primary color of the theme.                                        |
| `--harmony` | `-a`  | `string`  | The harmony of the theme. See [Harmonies] for accepted harmony values. |
| `--output`  | `-o`  | `string`  | The output file path.                                                  |
| `--config`  |       | `string`  | Path to your AutoTheme config file.                                    |
| `--preview` |       | `boolean` | Generate a preview.html to preview the theme.                          |
| `--silent`  | `-s`  | `boolean` | Suppress all output from AutoTheme.                                    |
| `--version` | `-v`  | `boolean` | Display version.                                                       |
| `--help`    | `-h`  | `boolean` | Display help.                                                          |

</details>

<!-- ### Accessible Colors

`text-accessible-a`
`text-accessible-a-light`
`text-accessible-a-dark`
`text-accessible-a-grey`
`text-accessible-a-contrast`
`text-accessible-b`
`text-accessible-b-light`
`text-accessible-b-dark`
`text-accessible-b-grey`
`text-accessible-b-contrast`

### Regular Colors

> Maybe remove a for Primary colors

`<base>-auto-<color>{modifier ? -<modifier> : ""}-<shade>`

`text-auto-a-50`
`text-auto-a-100`
`text-auto-a-200`
`text-auto-a-300`
`text-auto-a-400`
`text-auto-a-500` (default)
`text-auto-a-600`
`text-auto-a-700`
`text-auto-a-800`
`text-auto-a-900`
`text-auto-a-950`
`text-auto-a-grey-100` (grey is a special modifier that is added to each color)
`text-auto-a-grey-200`
`text-auto-a-grey-300`
`text-auto-a-grey-400`

`bg-auto-a` -->

## Accessible Colors

> AutoTheme aims to be WCAG 2.1 AAA compliant by default. (See [Understanding Contrast (WCAG)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html))

However because AutoTheme doesn't know what your actual background is going to be, it will generate 2 background colors for light & dark modes.

Then AutoTheme calculates the contrast ratio for each text color against the respective background color. _If the contrast ratio is below 7:1, it will generate a new color that meets the criteria._

> **Note to self**: This could be a nice feature enchancement. User could provide a background to the config file to generate the accessible colors against. Add to issues.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/text-dark.png">
  <img alt="Light Text Accessiblity" src="./docs/assets/text-light.png">
</picture>

> The background color here is `--at-bkgd` color, which is the primary background color, and is different for light & dark modes.

## Harmonies

> A set of colors related to each other.

Set your harmony using the `--harmony` or `-a` flag or the `harmony` option in the config file.

#### Complementary

<img src="docs/assets/complementary.png" />

<details>
<summary>See rest of available Harmonies</summary>

#### Split-Complementary

<img src="docs/assets/split-complementary.png" />

#### Analogous

<img src="docs/assets/analogous2.png" />

#### Triadic

<img src="docs/assets/triadic.png" />

#### Tetradic

<img src="docs/assets/tetradic.png" />

#### Square

<img src="docs/assets/square.png" />

#### Rectangle

<img src="docs/assets/rectangle.png" />

<!-- #### Lunar Eclipse -->

<!-- <img src="docs/assets/lunar-eclipse.png" /> -->

#### Aurelian

<img src="docs/assets/aurelian.png" />

#### Bi Polar

<img src="docs/assets/bi-polar.png" />

#### Retrograde

<img src="docs/assets/retrograde.png" />

<br>

> All examples are using `#6439FF` to illustrate the differences in harmonies.

</details>

### Full Color Palette

> In addition to the Harmony, each color has a set of tints, shades, and tones. And each of those colors has a set of accessible text colors. [See Accessible Colors](#accessible-colors)

<details>

<img src="docs/assets/harmony-details.png" />

Each color in the Harmony consists of:

-   **1 primary** color
-   **5 tints** (L1, ..., L5)
-   **5 shades** (D1, ..., D5)
-   **4 tones** (G1, ..., G4)

</details>

## Advanced Usage

### Gradients

> Gradients are a great way to add depth to your site.

#### Linear Gradient

> AutoTheme generates a linear gradient based on the primary color and each of harmony colors.

```css
.element {
	/* Basic Usage */
	background-image: var(--at-linear-1);
}
```

<img src="docs/assets/gradients.png" />

### :loud_sound: Noise

> Noise is a great way to add texture to your site.

  <img src="docs/assets/noise.png" />

#### Usage

Include the `--at-noise` variable in your CSS. Or if you are using TailwindCSS, you can use the `at-noise` class.

```css
.element {
	/* Basic Usage */
	background-image: var(--at-noise);
}
```

#### Advanced Usage

> Combine noise with gradients and blend modes to create unique effects.

```css
.element {
	/* Advanced Usage */
	background-image: var(--at-noise) var(--at-linear-1);
	background-blend-mode: overlay screen;
}
```

## Dark Mode

<details>

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

</details>

## Development

<details>

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

See the [Makefile](./Makefile) for more commands.

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

</details>

## Releasing

<details>

Releases are created via the `Release` workflow.

To create a new release, manually trigger the release workflow by going to the actions tab in the repo and selecting the `Release` workflow.

Enter the new version number when prompted and the workflow will take care of the rest.

-   [ ] Add on tag push trigger to the release workflow.

### Tagging Commits

Start your commit message with one of the following prefixes if you want to tag your commits in the changelog:

-   `feat - <YOUR_MESSAGE>` for new features
-   `fix - <YOUR_MESSAGE>` for bug fixes
-   `chore - <YOUR_MESSAGE>` for basically everything else

</details>
