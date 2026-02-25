import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { getStats } from "./api/stats"
import { fetchEvents } from "./api/calendar"

function apiPlugin() {
  return {
    name: "homepage-api",
    configureServer(server) {
      server.middlewares.use("/api/stats", async (_req, res) => {
        try {
          const stats = await getStats()
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify(stats))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: "Failed to get stats" }))
        }
      })
      server.middlewares.use("/api/calendar", async (_req, res) => {
        try {
          const events = await fetchEvents()
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify(events))
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: "Failed to get events" }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [apiPlugin(), preact(), tailwindcss()],
  server: {
    port: 4001,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
})
