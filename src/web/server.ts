import homepage from "./index.html";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": homepage,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`AutoTheme dev server running at ${server.url}`);
