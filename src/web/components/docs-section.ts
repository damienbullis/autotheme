export function initDocs(): void {
  const navContainer = document.getElementById("docs-nav");
  const contentContainer = document.getElementById("docs-content");

  if (!navContainer || !contentContainer) {
    return;
  }

  // Navigation
  navContainer.innerHTML = `
    <h2>Documentation</h2>
  `;

  // Content
  contentContainer.innerHTML = `
    <section>
      <h3>Getting Started</h3>
      <p>AutoTheme generates CSS custom properties based on color theory harmonies. Pick a primary color and harmony type to generate a complete color palette.</p>
    </section>

    <section>
      <h3>Harmonies</h3>
      <p>Each harmony type creates colors based on their position on the color wheel:</p>
      <ul>
        <li><strong>Complementary</strong> - Opposite colors (180 degrees)</li>
        <li><strong>Analogous</strong> - Adjacent colors (30 degrees apart)</li>
        <li><strong>Triadic</strong> - Three colors equally spaced (120 degrees)</li>
        <li><strong>Split-Complementary</strong> - Base + two adjacent to complement</li>
        <li><strong>Tetradic</strong> - Four colors in rectangle pattern</li>
        <li><strong>Square</strong> - Four colors equally spaced (90 degrees)</li>
      </ul>
    </section>

    <section>
      <h3>CSS Variables</h3>
      <p>Generated variables follow Tailwind v4 naming conventions:</p>
      <ul>
        <li><code>--color-primary-500</code> - Primary color (OKLCH)</li>
        <li><code>--color-primary-foreground</code> - Accessible text color</li>
        <li><code>--color-primary-50..400</code> - Tints (lighter)</li>
        <li><code>--color-primary-600..950</code> - Shades (darker)</li>
        <li><code>--color-primary-tone-1..4</code> - Tones (desaturated)</li>
        <li><code>--color-secondary-*</code> - Secondary harmony color</li>
        <li><code>--color-tertiary-*</code> - Tertiary harmony color</li>
      </ul>
    </section>

    <section>
      <h3>Usage</h3>
      <p>Use the generated CSS variables directly:</p>
      <p><code>background: var(--color-primary-500);</code></p>
      <p>OKLCH colors support native opacity:</p>
      <p><code>background: oklch(from var(--color-primary-500) l c h / 0.5);</code></p>
    </section>

    <section>
      <h3>CLI Usage</h3>
      <p>Install AutoTheme via npm:</p>
      <p><code>npm install autotheme</code></p>
      <p>Generate a theme:</p>
      <p><code>npx autotheme --color #6439FF --harmony analogous</code></p>
    </section>
  `;
}
