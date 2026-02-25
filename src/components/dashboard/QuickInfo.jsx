import { COLORS } from "@/constants/theme"
import { formatUptime } from "@/data/stats"

function InfoChip({ label, value, icon, color }) {
  return (
    <div class="stat-pill flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-cream border border-border-light">
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: `${color}15`,
          color,
        }}
      >
        <i class={`${icon} text-base`} aria-hidden="true" />
      </div>
      <span class="font-mono text-sm font-bold text-brown-800">{value}</span>
      <span class="font-nunito text-[11px] font-semibold text-brown-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}

export default function QuickInfo({ stats, serviceCount }) {
  return (
    <div
      class="animate-bounce-in bg-white rounded-3xl border-2 border-border-light p-5"
      style={{ animationDelay: "0.55s" }}
    >
      <div class="flex items-center gap-2 mb-4">
        <div class="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center">
          <i class="ri-information-line text-lg text-[#22C55E]" aria-hidden="true" />
        </div>
        <h2 class="font-fredoka text-xl font-semibold text-brown-800">
          Quick Info
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <InfoChip
          label="Uptime"
          value={formatUptime(stats.uptime)}
          icon="ri-time-line"
          color={COLORS.green}
        />
        <InfoChip
          label="Services"
          value={serviceCount}
          icon="ri-apps-2-line"
          color={COLORS.blue}
        />
        <InfoChip
          label="Download"
          value={`${stats.network.down} MB/s`}
          icon="ri-download-2-line"
          color={COLORS.purple}
        />
        <InfoChip
          label="Upload"
          value={`${stats.network.up} MB/s`}
          icon="ri-upload-2-line"
          color={COLORS.orange}
        />
      </div>
    </div>
  )
}
