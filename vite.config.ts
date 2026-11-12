import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Every build gets a unique id. It is baked into the app (__APP_VERSION__)
 * and written to /version.json, which the running app polls to notice a new
 * deploy and reload itself (see src/components/AppUpdater/AppUpdater.tsx).
 */
const BUILD_ID = new Date().toISOString();

const versionFile = (): Plugin => ({
  name: "app-version-file",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: BUILD_ID }),
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(BUILD_ID),
  },
});
