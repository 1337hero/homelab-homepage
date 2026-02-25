import { STATUS_LABELS } from "@/constants/theme"
import { useState } from "preact/hooks"

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      class="p-1.5 rounded-lg bg-brown-100 hover:bg-brown-200 active:scale-95 transition-all cursor-pointer"
      aria-label={`Copy ${text}`}
    >
      {copied ? (
        <i class="ri-check-line text-xs text-green-500" />
      ) : (
        <i class="ri-file-copy-line text-xs text-brown-400" />
      )}
    </button>
  )
}

function ServerDetails({ details }) {
  return (
    <div class="mt-3 space-y-1.5">
      <div class="flex items-center justify-between text-xs font-body">
        <span class="text-brown-400">Bedrock</span>
        <div class="flex items-center gap-2">
          <code class="text-brown-600">{details.host}:{details.bedrock}</code>
          <CopyButton text={`${details.host}:${details.bedrock}`} />
        </div>
      </div>
      <div class="flex items-center justify-between text-xs font-body">
        <span class="text-brown-400">Java</span>
        <div class="flex items-center gap-2">
          <code class="text-brown-600">{details.host}:{details.java}</code>
          <CopyButton text={`${details.host}:${details.java}`} />
        </div>
      </div>
    </div>
  )
}

export default function ServiceTile({ service, delay }) {
  const statusInfo = STATUS_LABELS[service.status]
  const isInfo = service.type === "info"
  const Tag = isInfo ? "div" : "a"

  return (
    <Tag
      {...(!isInfo && {
        href: service.url,
        target: "_blank",
        rel: "noopener noreferrer",
      })}
      class="card group block bg-white rounded-3xl border-2 border-border-light 
             overflow-hidden no-underline"
      style={{
        animationDelay: `${delay}s`
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
            <span class="text-xs font-body font-semibold text-brown-400">
              {statusInfo.label}
            </span>
          </div>
        </div>

        <h3 class="font-display text-lg font-semibold text-brown-800 mb-1 group-hover:text-brown-900">
          {service.name}
        </h3>
        <p class="font-body text-sm text-brown-500">
          {service.description}
        </p>

        {isInfo && service.details && <ServerDetails details={service.details} />}
      </div>
    </Tag>
  )
}
