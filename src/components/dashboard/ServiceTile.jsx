import { STATUS_LABELS } from "@/constants/theme"

export default function ServiceTile({ service, categoryColor, delay }) {
  const statusInfo = STATUS_LABELS[service.status]

  return (
    <a
      href={service.url}
      class="tile-hover group block bg-white rounded-3xl border-2 border-border-light
             overflow-hidden transition-all duration-300 no-underline"
      style={{
        animationDelay: `${delay}s`,
        borderLeftWidth: "6px",
        borderLeftColor: categoryColor,
      }}
    >
      <div class="p-5">
        <div class="flex items-start justify-between mb-3">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center
                   transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
            style={{
              backgroundColor: `${service.color}18`,
              color: service.color,
            }}
          >
            <i class={`${service.icon} text-2xl`} aria-hidden="true" />
          </div>

          <div class="flex items-center gap-1.5">
            <div class={`w-2.5 h-2.5 rounded-full ${statusInfo.dot} ${service.status === "warning" ? "animate-pulse-fade" : ""}`} />
            <span class="text-xs font-nunito font-semibold text-brown-400">
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h3 class="font-fredoka text-lg font-semibold text-brown-800 mb-1 group-hover:text-brown-900">
          {service.name}
        </h3>
        <p class="font-nunito text-sm text-brown-500">
          {service.description}
        </p>
      </div>

      <div
        class="h-1 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: categoryColor }}
      />
    </a>
  )
}
