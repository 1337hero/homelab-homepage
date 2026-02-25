import { COLORS } from "@/constants/theme"
import { formatBytes } from "@/data/stats"

function StatMini({ label, value, percent, color, icon }) {
  return (
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-2">
          <i class={`${icon} text-sm`} style={{ color }} aria-hidden="true" />
          <span class="font-fredoka text-sm font-medium text-brown-700">{label}</span>
        </div>
        <span class="font-mono text-xs text-brown-500">{value}</span>
      </div>
      <div class="w-full h-3 bg-cream-dark rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

export default function StatsPanel({ stats }) {
  const { cpuPercent, ramPercent, diskPercent } = stats

  return (
    <div
      class="animate-bounce-in bg-white rounded-3xl border-2 border-border-light p-5"
      style={{ animationDelay: "0.45s" }}
    >
      <div class="flex items-center gap-2 mb-5">
        <div class="w-9 h-9 rounded-xl bg-[#A855F7]/15 flex items-center justify-center">
          <i class="ri-dashboard-3-line text-lg text-[#A855F7]" aria-hidden="true" />
        </div>
        <h2 class="font-fredoka text-xl font-semibold text-brown-800">
          Server Vibes
        </h2>
      </div>

      <div class="space-y-4">
        <StatMini
          label="CPU"
          value={`${cpuPercent}%`}
          percent={cpuPercent}
          color={COLORS.blue}
          icon="ri-cpu-line"
        />
        <StatMini
          label="RAM"
          value={`${formatBytes(stats.ram.used)} / ${formatBytes(stats.ram.total)}`}
          percent={ramPercent}
          color={COLORS.green}
          icon="ri-ram-line"
        />
        <StatMini
          label="Disk"
          value={`${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`}
          percent={diskPercent}
          color={COLORS.orange}
          icon="ri-hard-drive-3-line"
        />
        <StatMini
          label="Temp"
          value={`${stats.temp}°C`}
          percent={Math.min(stats.temp, 100)}
          color={stats.temp > 70 ? COLORS.red : COLORS.yellow}
          icon="ri-temp-hot-line"
        />
      </div>
    </div>
  )
}
