import { useQuery } from "@tanstack/react-query"

async function fetchStats() {
  const res = await fetch("/api/stats")
  if (!res.ok) throw new Error(res.statusText)
  const raw = await res.json()
  return {
    ...raw,
    cpuPercent: Math.round(raw.cpu),
    ramPercent: Math.round((raw.ram.used / raw.ram.total) * 100),
    diskPercent: Math.round((raw.disk.used / raw.disk.total) * 100),
  }
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 0,
    refetchInterval: 3000,
  })
}
