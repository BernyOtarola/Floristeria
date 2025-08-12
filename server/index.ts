// server/index.ts (fragmento relevante)
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createViteServer } from "./vite";

const isDev = process.env.NODE_ENV !== "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "../client");
const distPublic = path.resolve(__dirname, "../dist/public");

const app = express();

// ...tus rutas de API aquí...

if (isDev) {
  const vite = await createViteServer();
  app.use(vite.middlewares);

  app.get("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const indexPath = path.resolve(clientRoot, "index.html");
      let html = fs.readFileSync(indexPath, "utf-8");
      html = await vite.transformIndexHtml(url, html);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  app.use(express.static(distPublic));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPublic, "index.html"));
  });
}

app.listen(3000, () => {
  console.log("🌸 FloraVista serving on http://localhost:3000");
});
