import { useClock } from "@/hooks/useClock"

function getGreetingData(hour) {
  if (hour < 5)  return { greeting: "Night owl mode",          emoji: "🦉" }
  if (hour < 12) return { greeting: "Good morning, Family!",   emoji: "☀️" }
  if (hour < 17) return { greeting: "Good afternoon, Family!", emoji: "🌤️" }
  if (hour < 21) return { greeting: "Good evening, Family!",   emoji: "🌅" }
  return                { greeting: "Bedtime soon, Family!",   emoji: "🌙" }
}

export default function HeroSection() {
  const now = useClock()
  const { greeting, emoji } = getGreetingData(now.getHours())

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <section
      class="animate-bounce-in mt-6 sm:mt-8 mb-8 text-center"
      style={{ animationDelay: "0.1s" }}
    >
      <div class="animate-wave text-4xl sm:text-5xl mb-3" aria-hidden="true">
        {emoji}
      </div>
      <h1 class="font-fredoka text-3xl sm:text-4xl lg:text-5xl font-semibold text-brown-800 mb-2">
        {greeting}
      </h1>
      <div class="font-fredoka text-5xl sm:text-6xl lg:text-7xl font-bold text-brown-700 tracking-tight mb-1">
        {timeStr}
      </div>
      <p class="font-nunito text-lg text-brown-500">{dateStr}</p>
    </section>
  )
}
