import express from "express";
import { registerRoutes } from "./routes";
import { fileURLToPath } from "url";
import path from "path";

async function startServer() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from the React app build directory
  if (process.env.NODE_ENV === "production") {
    const staticPath = path.join(__dirname, "public");
    app.use(express.static(staticPath));
    
    // Handle React routing, return all requests to React app
    app.get("*", (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(staticPath, "index.html"));
    });
  }

  const server = await registerRoutes(app);

  // For development, integrate with Vite
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.ssrFixStacktrace);
    app.use("*", vite.middlewares);
  }

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);