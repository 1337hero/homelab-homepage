const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const GOOGLE_CALENDAR_IDS = process.env.GOOGLE_CALENDAR_IDS

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3"
const CACHE_TTL = 5 * 60 * 1000
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000

let eventCache = { events: [], ts: 0 }
let tokenCache = { accessToken: "", expiresAt: 0 }
let tokenRefreshPromise = null

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

function hasGoogleConfig() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN && getCalendarIds().length)
}

function getCalendarIds() {
  return (GOOGLE_CALENDAR_IDS || GOOGLE_CALENDAR_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

async function refreshAccessToken() {
  const body = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    refresh_token: GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  })

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Google OAuth token refresh failed (${res.status}): ${errorText}`)
  }

  const tokenData = await res.json()
  if (!tokenData.access_token || !tokenData.expires_in) {
    throw new Error("Google OAuth token refresh response missing access_token or expires_in")
  }

  tokenCache = {
    accessToken: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000,
  }

  return tokenCache.accessToken
}

async function getAccessToken({ forceRefresh = false } = {}) {
  const tokenIsFresh = tokenCache.accessToken && Date.now() < tokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS
  if (!forceRefresh && tokenIsFresh) return tokenCache.accessToken

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = refreshAccessToken().finally(() => {
      tokenRefreshPromise = null
    })
  }

  return tokenRefreshPromise
}

function parseGoogleStart(start) {
  if (start?.dateTime) {
    return { date: new Date(start.dateTime), allDay: false }
  }

  if (start?.date) {
    // Parse date-only values in local time to avoid UTC date shifts in UI.
    return { date: new Date(`${start.date}T12:00:00`), allDay: true }
  }

  return { date: null, allDay: false }
}

async function fetchGoogleEvents(accessToken, configuredCalendarId) {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const calendarId = encodeURIComponent(configuredCalendarId)

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: cutoff.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "8",
  })

  return fetch(`${CALENDAR_BASE_URL}/calendars/${calendarId}/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

function mapEvents(items) {
  return (items || [])
    .map((event) => {
      const { date, allDay } = parseGoogleStart(event.start)
      if (!date || Number.isNaN(date.getTime())) return null

      const title = event.summary || "Untitled"
      return {
        id: event.id || event.iCalUID || crypto.randomUUID(),
        title,
        time: allDay ? "All day" : formatTime(date),
        date: formatDate(date),
        color: colorFromTitle(title),
        icon: "ri-calendar-event-line",
        startTime: date.getTime(),
        dedupeKey: `${event.iCalUID || event.id || title}:${date.getTime()}`,
      }
    })
    .filter(Boolean)
}

async function fetchEvents() {
  if (!hasGoogleConfig()) return []
  if (Date.now() - eventCache.ts < CACHE_TTL) return eventCache.events

  const calendarIds = getCalendarIds()
  let accessToken = await getAccessToken()
  let responses = await Promise.all(calendarIds.map((calendarId) => fetchGoogleEvents(accessToken, calendarId)))

  if (responses.some((res) => res.status === 401)) {
    accessToken = await getAccessToken({ forceRefresh: true })
    responses = await Promise.all(calendarIds.map((calendarId) => fetchGoogleEvents(accessToken, calendarId)))
  }
  const events = []

  for (const res of responses) {
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Google Calendar events request failed (${res.status}): ${errorText}`)
    }

    const data = await res.json()
    events.push(...mapEvents(data.items))
  }

  events.sort((a, b) => a.startTime - b.startTime)
  const seenEvents = new Set()
  const upcomingEvents = events
    .filter((event) => {
      if (seenEvents.has(event.dedupeKey)) return false
      seenEvents.add(event.dedupeKey)
      return true
    })
    .slice(0, 8)
    .map(({ startTime: _startTime, dedupeKey: _dedupeKey, ...event }) => event)

  eventCache = { events: upcomingEvents, ts: Date.now() }
  return upcomingEvents
}

export { fetchEvents }
