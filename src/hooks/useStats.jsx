import { useQuery } from "@tanstack/react-query"
import { normalizeStats } from "@/data/stats"

async function fetchStats() {
  const res = await fetch("/api/stats")
  if (!res.ok) throw new Error(res.statusText)
  return normalizeStats(await res.json())
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 0,
    refetchInterval: 3000,
  })
}
