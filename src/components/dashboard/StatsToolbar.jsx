import { COLORS } from "@/constants/theme"
import { formatUptime } from "@/data/stats"

function StatPill({ icon, label, value, color }) {
  return (
    <div
      class="stat-pill flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2"
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}08`,
      }}
    >
      <i class={`${icon} text-base`} style={{ color }} aria-hidden="true" />
      <span class="font-nunito text-xs font-bold text-brown-500 uppercase tracking-wide">
        {label}
      </span>
      <span class="font-mono text-sm font-semibold text-brown-800">{value}</span>
    </div>
  )
}

export default function StatsToolbar({ stats }) {
  const { cpuPercent, ramPercent, diskPercent } = stats

  return (
    <section
      class="animate-bounce-in mt-10 mb-4"
      style={{ animationDelay: "0.6s" }}
    >
      <div class="bg-white rounded-3xl border-2 border-border-light p-4 sm:p-5">
        <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <StatPill icon="ri-cpu-line" label="CPU" value={`${cpuPercent}%`} color={COLORS.blue} />
          <StatPill icon="ri-ram-line" label="RAM" value={`${ramPercent}%`} color={COLORS.green} />
          <StatPill icon="ri-hard-drive-3-line" label="Disk" value={`${diskPercent}%`} color={COLORS.orange} />
          <StatPill icon="ri-temp-hot-line" label="Temp" value={`${stats.temp}°C`} color={stats.temp > 70 ? COLORS.red : COLORS.yellow} />
          <StatPill icon="ri-time-line" label="Uptime" value={formatUptime(stats.uptime)} color={COLORS.purple} />
          <StatPill icon="ri-download-2-line" label="Down" value={`${stats.network.down} MB/s`} color={COLORS.red} />
          <StatPill icon="ri-upload-2-line" label="Up" value={`${stats.network.up} MB/s`} color={COLORS.blue} />
        </div>
      </div>
    </section>
  )
}
