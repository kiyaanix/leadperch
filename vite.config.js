import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Used for local development only: `npm run dev`.
// Serves index.html + src/dev-main.js with full HMR so you can iterate on
// components quickly. This config is NOT used for the distributable build —
// see vite.embed.config.js for that.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
