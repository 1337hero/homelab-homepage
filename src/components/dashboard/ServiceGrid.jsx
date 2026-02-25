import ServiceTile from "@/components/dashboard/ServiceTile"
import { CATEGORY_THEMES } from "@/constants/theme"

export default function ServiceGrid({ services }) {
  const categories = [...new Set(services.map((s) => s.category))]

  return (
    <div class="space-y-10">
      {categories.map((cat, catIdx) => {
        const theme = CATEGORY_THEMES[cat]
        const catServices = services.filter((s) => s.category === cat).sort((a, b) => a.order - b.order)

        return (
          <section key={cat}>
            <div
              class="category-header flex items-center gap-3 mb-5"
              style={{ animationDelay: `${0.2 + catIdx * 0.1}s` }}
            >
              <span class="text-2xl" aria-hidden="true">{theme.emoji}</span>
              <h2
                class="font-display text-2xl font-semibold"
                style={{ color: theme.color }}
              >
                {theme.label}
              </h2>
              <div
                class="flex-1 h-[3px] rounded-full opacity-30"
                style={{ backgroundColor: theme.color }}
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {catServices.map((service, i) => (
                <ServiceTile
                  key={service.name}
                  service={service}
                  delay={0.3 + catIdx * 0.1 + i * 0.06}
                />
              ))}
            </div>
          </section>
        )
      })}

      {services.length === 0 && (
        <div class="animate-bounce-in text-center py-16">
          <div class="text-6xl mb-4">🔍</div>
          <p class="font-display text-2xl text-brown-500 mb-2">
            Nothing found!
          </p>
          <p class="font-body text-brown-400">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  )
}
