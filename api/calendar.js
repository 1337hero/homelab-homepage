import ical from "node-ical"

const ICAL_URL = process.env.ICAL_URL
const CACHE_TTL = 5 * 60 * 1000

let cache = { events: [], ts: 0 }

const EVENT_COLORS = ["#3B82F6", "#A855F7", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#F97316", "#EC4899"]

function colorFromTitle(title) {
  let hash = 0
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

async function fetchEvents() {
  if (!ICAL_URL) return []
  if (Date.now() - cache.ts < CACHE_TTL) return cache.events

  const data = await ical.async.fromURL(ICAL_URL)
  const now = new Date()
  const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const events = Object.values(data)
    .filter((e) => e.type === "VEVENT" && e.start && new Date(e.start) >= now && new Date(e.start) <= cutoff)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 8)
    .map((e) => ({
      id: e.uid,
      title: e.summary || "Untitled",
      time: formatTime(new Date(e.start)),
      date: formatDate(new Date(e.start)),
      color: colorFromTitle(e.summary || ""),
      icon: "ri-calendar-event-line",
    }))

  cache = { events, ts: Date.now() }
  return events
}

export { fetchEvents }
