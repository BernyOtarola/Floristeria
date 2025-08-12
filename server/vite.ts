// server/vite.ts
import { createServer, type ViteDevServer } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

export async function createViteServer(): Promise<ViteDevServer> {
  const root = fileURLToPath(new URL("../client", import.meta.url));
  const shared = fileURLToPath(new URL("../shared", import.meta.url));
  const assets = fileURLToPath(new URL("../attached_assets", import.meta.url));

  // Usamos el config de vite.config.ts, pero forzamos root y fs.allow
  const vite = await createServer({
    root,
    appType: "custom",
    server: {
      middlewareMode: true,
      fs: {
        strict: true,
        allow: [root, shared, assets],
      },
    },
  });

  return vite;
}
