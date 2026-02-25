import { useEffect, useState } from "preact/hooks"

function deriveStats(raw) {
  return {
    ...raw,
    cpuPercent: Math.round(raw.cpu),
    ramPercent: Math.round((raw.ram.used / raw.ram.total) * 100),
    diskPercent: Math.round((raw.disk.used / raw.disk.total) * 100),
  }
}

export function useStats(interval = 3000) {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats")
        if (!res.ok) throw new Error(res.statusText)
        const raw = await res.json()
        if (active) {
          setStats(deriveStats(raw))
          setError(null)
        }
      } catch (e) {
        if (active) setError(e.message)
      }
    }

    fetchStats()
    const id = setInterval(fetchStats, interval)
    return () => { active = false; clearInterval(id) }
  }, [interval])

  return { stats, error }
}
