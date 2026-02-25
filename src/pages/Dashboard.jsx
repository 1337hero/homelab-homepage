import CalendarWidget from "@/components/dashboard/CalendarWidget";
import HeroSection from "@/components/dashboard/HeroSection";
import SearchBar from "@/components/dashboard/SearchBar";
import ServiceGrid from "@/components/dashboard/ServiceGrid";
import StatsPanel from "@/components/dashboard/StatsPanel";
import { useServices } from "@/hooks/useServices";
import { useStats } from "@/hooks/useStats";
import { useState } from "preact/hooks";

export default function Dashboard() {
  const { services } = useServices()
  const { stats, error } = useStats(3000)
  const [search, setSearch] = useState("")
  const onlineCount = services.filter((s) => s.status === "online").length

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
          {stats && <StatsPanel stats={stats} serviceCount={`${onlineCount}/${services.length}`} />}
        </aside>
      </div>
    </>
  );
}
