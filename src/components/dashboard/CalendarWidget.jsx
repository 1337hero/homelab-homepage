import { useCalendar } from "@/hooks/useCalendar"

export default function CalendarWidget() {
  const { events } = useCalendar()

  return (
    <div
      class="animate-bounce-in bg-white rounded-3xl border-2 border-border-light p-5"
      style={{ animationDelay: "0.35s" }}
    >
      <div class="flex items-center gap-2 mb-5">
        <div class="w-9 h-9 rounded-xl bg-[#FBBF24]/15 flex items-center justify-center">
          <i class="ri-calendar-event-line text-lg text-[#FBBF24]" aria-hidden="true" />
        </div>
        <h2 class="font-display text-xl font-semibold text-brown-800">
          Coming Up
        </h2>
      </div>

      {events.length === 0 ? (
        <p class="font-body text-sm text-brown-400 text-center py-4">
          No upcoming events
        </p>
      ) : (
        <div class="space-y-3">
          {events.map((event, i) => (
            <div
              key={event.id}
              class="calendar-card flex items-center gap-3 p-3 rounded-2xl bg-cream border border-border-light"
              style={{ animationDelay: `${0.4 + i * 0.06}s` }}
            >
              <div
                class="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: `${event.color}18`,
                  color: event.color,
                }}
              >
                <i class={`${event.icon} text-lg`} aria-hidden="true" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-display text-sm font-semibold text-brown-800 truncate">
                  {event.title}
                </p>
                <p class="font-body text-xs text-brown-500">
                  {event.date} &middot; {event.time}
                </p>
              </div>
              <i
                class="ri-arrow-right-s-line text-brown-300 flex-shrink-0"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
