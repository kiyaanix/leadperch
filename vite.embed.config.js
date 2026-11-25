import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// Used to produce the single-file, drop-in-anywhere widget script:
//   npm run build:embed
//
// Output: dist-embed/chat-widget.js
//   - IIFE format so it runs as a plain <script src="..."> with no bundler
//     or module support required on the host page.
//   - React/ReactDOM/Zod are all bundled in (host page needs nothing).
//   - Any CSS emitted by Vite/React is inlined into the JS via
//     vite-plugin-css-injected-by-js (belt-and-suspenders — the widget's
//     own styles are actually injected via a <style> tag inside the Shadow
//     DOM at runtime, see src/lib/widgetStyles.js, so this mainly guards
//     against stray global CSS output).
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  // React/ReactDOM check `process.env.NODE_ENV` internally (dev-mode
  // warnings, etc). In Vite's app-mode build this gets replaced
  // automatically, but library-mode IIFE output doesn't always strip it,
  // leaving a literal `process.env.NODE_ENV` reference in the bundle.
  // The host page's browser has no `process` global at all, so that line
  // throws "process is not defined" the instant the script runs.
  // Defining it here makes esbuild/Rollup inline the string and dead-code
  // eliminate the unreached dev-only branches, so no runtime reference to
  // `process` survives into the output file.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    lib: {
      entry: "src/embed.js",
      name: "ChatWidgetLib",
      formats: ["iife"],
      fileName: () => "chat-widget.js",
    },
    rollupOptions: {
      // Bundle everything — no externals — so the output file is fully
      // self-contained for any host site.
      output: {
        extend: true,
      },
    },
    minify: "esbuild",
    sourcemap: false,
  },
});