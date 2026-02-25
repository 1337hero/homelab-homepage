import { useEffect, useState } from "preact/hooks"

export function useCalendar(interval = 5 * 60 * 1000) {
  const [events, setEvents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar")
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        if (active) {
          setEvents(data)
          setError(null)
        }
      } catch (e) {
        if (active) setError(e.message)
      }
    }

    fetchEvents()
    const id = setInterval(fetchEvents, interval)
    return () => { active = false; clearInterval(id) }
  }, [interval])

  return { events, error }
}
