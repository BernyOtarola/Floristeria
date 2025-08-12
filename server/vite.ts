// server/vite.ts
import { createServer, type ViteDevServer } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

export async function createViteServer(): Promise<ViteDevServer> {
  const serverDir = path.dirname(fileURLToPath(new URL(import.meta.url)));
  const projectRoot = path.resolve(serverDir, "..");        // <repo root>
  const clientRoot = path.resolve(projectRoot, "client");
  const shared = path.resolve(projectRoot, "shared");
  const assets = path.resolve(projectRoot, "attached_assets");

  const vite = await createServer({
    // 👇 MUY IMPORTANTE: usa tu vite.config.ts (donde definiste alias "@")
    configFile: path.resolve(projectRoot, "vite.config.ts"),
    root: clientRoot,
    appType: "custom",
    server: {
      middlewareMode: true,
      fs: {
        strict: true,
        allow: [clientRoot, shared, assets, projectRoot],
      },
    },
  });

  return vite;
}
