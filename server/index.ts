// server/index.ts
import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createViteServer } from "./vite";
import { registerRoutes } from "./routes";

const isDev = process.env.NODE_ENV !== "production";
const PORT = Number(process.env.PORT || 3000);

// Rutas del cliente (SPA)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, "../client");
const distPublic = path.resolve(__dirname, "../dist/public");

async function main() {
  const app = express();

  // Confianza en proxy (útil si despliegas detrás de Nginx/Render/Heroku)
  if (!isDev) app.set("trust proxy", 1);

  // Middlewares básicos para la API
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Registra todas las rutas de la API (incluye sesiones y auth unificado)
  const httpServer = await registerRoutes(app);

  // ---- Frontend: Vite en dev, estáticos en prod ----
  if (isDev) {
    const vite = await createViteServer();
    app.use(vite.middlewares);

    // Cualquier ruta NO API sirve el index.html de Vite (SPA)
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
    // Producción: servir /dist/public
    app.use(express.static(distPublic, { maxAge: "1h", index: false }));
    // SPA fallback
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPublic, "index.html"));
    });
  }

  // Arrancar servidor HTTP
  httpServer.listen(PORT, () => {
    const mode = isDev ? "development" : "production";
    console.log(`🌸 FloraVista serving on http://localhost:${PORT} (${mode})`);
    console.log(`📚 API available at http://localhost:${PORT}/api`);
    console.log(
      process.env.USE_DB === "true"
        ? "🗄️  Storage: Prisma + MySQL"
        : "💾 Storage: MemStorage (en memoria)"
    );
    if (!process.env.OPENAI_API_KEY) {
      console.log("🤖 AI Assistant: Demo Mode (OPENAI_API_KEY no configurada)");
    }
  });

  // Errores no atrapados
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });
}

main().catch((err) => {
  console.error("Fatal error on server start:", err);
  process.exit(1);
});

