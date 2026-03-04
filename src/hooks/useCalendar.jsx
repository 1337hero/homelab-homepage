import { useQuery } from "@tanstack/react-query"

async function fetchCalendar() {
  const res = await fetch("/api/calendar")
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export function useCalendar() {
  const { data: events = [], error } = useQuery({
    queryKey: ["calendar"],
    queryFn: fetchCalendar,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
  return { events, error }
}
