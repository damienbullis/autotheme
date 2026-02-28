/**
 * Resize Warp terminal to a consistent size for README asset screenshots.
 *
 * Usage:
 *   bun run screenshot            # 800x500 (default)
 *   bun run screenshot 600 400    # custom width x height
 */

const width = Number(process.argv[2]) || 800;
const height = Number(process.argv[3]) || 500;

async function resize(width: number, height: number) {
  const position = Bun.spawn([
    "osascript",
    "-e",
    `tell application "System Events" to tell process "Warp" to set position of window 1 to {0, 0}`,
  ]);
  await position.exited;

  const size = Bun.spawn([
    "osascript",
    "-e",
    `tell application "System Events" to tell process "Warp" to set size of window 1 to {${width}, ${height}}`,
  ]);
  await size.exited;
}

await resize(width, height);

console.log(`Warp resized to ${width}x${height}`);
console.log("Take screenshot: Cmd+Shift+4 → Space → click the window");
