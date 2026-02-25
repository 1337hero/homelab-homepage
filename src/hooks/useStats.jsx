import { useEffect, useState } from "preact/hooks"
import { getMockStats } from "@/data/stats"

function deriveStats(raw) {
  return {
    ...raw,
    cpuPercent: Math.round(raw.cpu),
    ramPercent: Math.round((raw.ram.used / raw.ram.total) * 100),
    diskPercent: Math.round((raw.disk.used / raw.disk.total) * 100),
  }
}

export function useStats(interval = 3000) {
  const [stats, setStats] = useState(() => deriveStats(getMockStats()))

  useEffect(() => {
    const id = setInterval(() => setStats(deriveStats(getMockStats())), interval)
    return () => clearInterval(id)
  }, [interval])

  return stats
}
