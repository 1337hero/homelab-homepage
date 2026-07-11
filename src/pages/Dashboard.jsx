import CalendarWidget from "@/components/dashboard/CalendarWidget";
import HeroSection from "@/components/dashboard/HeroSection";
import SearchBar from "@/components/dashboard/SearchBar";
import ServiceGrid from "@/components/dashboard/ServiceGrid";
import StatsPanel from "@/components/dashboard/StatsPanel";
import { useServices } from "@/hooks/useServices";
import { useStats } from "@/hooks/useStats";
import { useState } from "preact/hooks";

function StatsPanelSkeleton() {
  return (
    <div class="bg-white rounded-3xl border-2 border-border-light p-5 animate-pulse">
      <div class="flex items-center gap-2 mb-5">
        <div class="w-9 h-9 rounded-xl bg-cream-dark" />
        <div class="h-5 w-28 rounded-lg bg-cream-dark" />
      </div>
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="h-20 rounded-2xl bg-cream-dark" />
        <div class="h-20 rounded-2xl bg-cream-dark" />
      </div>
      <div class="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} class="space-y-1.5">
            <div class="h-4 w-24 rounded bg-cream-dark" />
            <div class="h-3 w-full rounded-full bg-cream-dark" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { services } = useServices()
  const { data: stats, isLoading: statsLoading } = useStats()
  const [search, setSearch] = useState("")
  const filteredServices = search.trim()
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase()),
      )
    : services;

  return (
    <>
      <HeroSection />

      <SearchBar
        value={search}
        onInput={(e) => setSearch(e.target.value)}
        onClear={() => setSearch("")}
      />
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
        <ServiceGrid services={filteredServices} />

        <aside class="space-y-6">
          <CalendarWidget />
          {statsLoading ? <StatsPanelSkeleton /> : stats && <StatsPanel stats={stats} />}
        </aside>
      </div>
    </>
  );
}
