import { useQuery } from "@tanstack/react-query"

export function useServices() {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["services"],
    queryFn: () => fetch("/api/services").then((r) => r.json()),
  })

  return { services, isLoading, error }
}
