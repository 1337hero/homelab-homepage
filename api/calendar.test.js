import { afterEach, beforeEach, expect, mock, test } from "bun:test"

const originalFetch = globalThis.fetch

beforeEach(() => {
  process.env.GOOGLE_CLIENT_ID = "client-id"
  process.env.GOOGLE_CLIENT_SECRET = "client-secret"
  process.env.GOOGLE_REFRESH_TOKEN = "refresh-token"
  process.env.GOOGLE_CALENDAR_IDS = "work@example.com, family@example.com"
  delete process.env.GOOGLE_CALENDAR_ID
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

test("fetchEvents merges configured calendars in start-time order", async () => {
  const now = Date.now()
  const workStart = new Date(now + 2 * 60 * 60 * 1000).toISOString()
  const familyStart = new Date(now + 60 * 60 * 1000).toISOString()

  globalThis.fetch = mock(async (input) => {
    const url = String(input)

    if (url.includes("oauth2.googleapis.com/token")) {
      return Response.json({ access_token: "access-token", expires_in: 3600 })
    }

    if (url.includes(encodeURIComponent("work@example.com"))) {
      return Response.json({
        items: [{ id: "work-event", summary: "Work", start: { dateTime: workStart } }],
      })
    }

    if (url.includes(encodeURIComponent("family@example.com"))) {
      return Response.json({
        items: [{ id: "family-event", summary: "Family", start: { dateTime: familyStart } }],
      })
    }

    return new Response("Unexpected request", { status: 404 })
  })

  const { fetchEvents } = await import(`./calendar.js?test=${crypto.randomUUID()}`)

  expect((await fetchEvents()).map((event) => event.id)).toEqual(["family-event", "work-event"])
})

test("fetchEvents shows a shared event only once", async () => {
  const start = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  globalThis.fetch = mock(async (input) => {
    const url = String(input)

    if (url.includes("oauth2.googleapis.com/token")) {
      return Response.json({ access_token: "access-token", expires_in: 3600 })
    }

    return Response.json({
      items: [{
        id: url.includes(encodeURIComponent("work@example.com")) ? "work-copy" : "family-copy",
        iCalUID: "shared-event@example.com",
        summary: "Shared event",
        start: { dateTime: start },
      }],
    })
  })

  const { fetchEvents } = await import(`./calendar.js?test=${crypto.randomUUID()}`)

  expect(await fetchEvents()).toHaveLength(1)
})

test("fetchEvents refreshes and retries all calendars after an unauthorized response", async () => {
  let tokenRequests = 0
  const start = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  globalThis.fetch = mock(async (input, init) => {
    const url = String(input)

    if (url.includes("oauth2.googleapis.com/token")) {
      tokenRequests += 1
      return Response.json({ access_token: `access-token-${tokenRequests}`, expires_in: 3600 })
    }

    if (init?.headers?.Authorization === "Bearer access-token-1") {
      return new Response("Unauthorized", { status: 401 })
    }

    return Response.json({
      items: [{
        id: url.includes(encodeURIComponent("work@example.com")) ? "work-event" : "family-event",
        summary: "Event",
        start: { dateTime: start },
      }],
    })
  })

  const { fetchEvents } = await import(`./calendar.js?test=${crypto.randomUUID()}`)

  expect(await fetchEvents()).toHaveLength(2)
  expect(tokenRequests).toBe(2)
})
