// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("./client", import.meta.url));
const sharedDir = fileURLToPath(new URL("./shared", import.meta.url));
const assetsDir = fileURLToPath(new URL("./attached_assets", import.meta.url));
const outDir = fileURLToPath(new URL("./dist/public", import.meta.url));

export default defineConfig(async ({ mode }) => {
  const plugins = [react(), runtimeErrorOverlay()];

  if (mode !== "production" && process.env.REPL_ID) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    root,
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(root, "src"),
        "@shared": sharedDir,
        "@assets": assetsDir,
      },
    },
    build: {
      outDir,
      emptyOutDir: true,
    },
    server: {
      fs: {
        // Permite servir/importar fuera de `client` cuando uses alias
        allow: [root, sharedDir, assetsDir],
        deny: ["**/.*"],
      },
    },
  };
});
