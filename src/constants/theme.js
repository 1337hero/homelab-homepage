export const COLORS = {
  red: "#EF4444",
  blue: "#3B82F6",
  yellow: "#FBBF24",
  green: "#22C55E",
  purple: "#A855F7",
  orange: "#F97316",
}

export const CATEGORY_THEMES = {
  media: { color: COLORS.red, emoji: "🎬", label: "Play & Watch" },
  family: { color: COLORS.blue, emoji: "👨‍👩‍👧‍👦", label: "Our Family Stuff" },
  infrastructure: { color: COLORS.purple, emoji: "🔧", label: "Behind the Scenes" },
  tools: { color: COLORS.orange, emoji: "🧰", label: "Toolbox" },
}

export const STATUS_LABELS = {
  online: { dot: "bg-green-400", label: "Happy" },
  warning: { dot: "bg-yellow-400", label: "Hmm" },
  offline: { dot: "bg-red-400", label: "Uh-oh" },
}
