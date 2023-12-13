# AutoTheme

> A _`zero-config`_ build tool for generating accessible CSS themes using color theory.

## Roapmap

- [ ] Core
  - [ ] Finish config file
    - [ ] Add json schema for the config file
    - [ ] Add Tests
- [ ] Installers
  - [ ] bash cli install
  - [ ] go install
  - [ ] npm install
- [ ] Plugins
  - [ ] Tailwind
  - [ ] ~~Rollup/Vite~~ (On hold because of Rolldown announcement)
- [ ] Darkmode script snippet in README
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
     const root = document.documentElement;
     if (localStorage.getItem("darkMode") === "true" || darkMode.matches) {
       root.classList.add("at-dark");
     }

     // If the user's system changes the preferred color scheme
     darkMode.addEventListener("change", (e) => {
       if (e.matches) {
         root.classList.add("at-dark");
       } else {
         root.classList.remove("at-dark");
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
     const root = document.documentElement;
     if (localStorage.getItem("darkMode") === "true" || darkMode.matches) {
       root.classList.add("at-dark");
     }

     // This wont set the local storage on change, but it will update the class
     darkMode.addEventListener("change", (e) => {
       if (e.matches) {
         root.classList.add("at-dark");
       } else {
         root.classList.remove("at-dark");
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
