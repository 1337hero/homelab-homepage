import { getStats } from "./api/stats"
import { fetchEvents } from "./api/calendar"

const PORT = process.env.PORT || 4000
const DIST = "./dist"

Bun.serve({
  port: PORT,

  routes: {
    "/api/stats": async () => {
      try {
        const stats = await getStats()
        return Response.json(stats)
      } catch (e) {
        console.error("stats error:", e)
        return Response.json({ error: "Failed to get stats" }, { status: 500 })
      }
    },
    "/api/calendar": async () => {
      try {
        const events = await fetchEvents()
        return Response.json(events)
      } catch (e) {
        console.error("calendar error:", e)
        return Response.json({ error: "Failed to get events" }, { status: 500 })
      }
    },
  },

  fetch(req) {
    const url = new URL(req.url)
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname
    const file = Bun.file(`${DIST}${filePath}`)
    return new Response(file)
  },
})

console.log(`HomeBase server running on :${PORT}`)
