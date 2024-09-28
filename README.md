<div style='text-align:center;'>
<h1>AutoTheme</h1>
<h3>Some Badges here</h3>
</div>

> A _`zero-config`_ & _`zero-dependency`_ tool for generating accessible CSS themes using color theory.

## Table of Contents

1. [Install](#install)
2. [Usage](#usage)
   - Entrypoint
   - Preview?
   - Customizing
   - [Dark Mode](#dark-mode)
   - Others???
3. [Configuring](#configuring)
4. [CLI](#cli)
5. [Roadmap](#roapmap)

## Install

_finish_

<br>

## Usage

Depending on your use case, you may only need to generate a theme once, and not need to change things. In this case, just run AutoTheme through your terminal and call it a day.

In other cases you may want AutoTheme to be apart of a build step.

### No Dependency

After installing, you can just run

```bash
autotheme
```

#### Thats it!

Now if you _want_ to go customize further, AutoTheme does provide some cli flags.
Run `--help` for options.

Additionally you can run

```bash
autotheme init
```

to go through an interactive prompt where you can also provide some customization.

<br>

### Dev Dependency

_finish_

<br>

## Configuring

_finish_

<br>

## CLI

_finish_

<br>

## Roapmap

- [ ] Core
  - [ ] Add json schema for the config file
  - [ ] Add Tests
- [ ] Installers
  - [ ] bash cli install
  - [ ] go install
  - [ ] npm install
- [/] Plugins
  - [x] Tailwind
  - [/] ~~Rollup/Vite~~ (On hold because of Rolldown announcement)
- [x] Darkmode script snippet in README
- [ ] index.html integration (entrypoint)
  - [ ] include snippet in README
- [ ] index.css integration (output)

<br>
<br>

# Dark Mode

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

### Now your site is ready to support both `light` & `dark` color schemes based on user preferences.

---
---
---

# Development

## Setup

```bash
git clone
cd autotheme
```

