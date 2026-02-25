const today = new Date()
const fmt = (d) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })

const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const dayAfter = new Date(today)
dayAfter.setDate(today.getDate() + 2)

export const calendarEvents = [
  {
    id: "1",
    title: "Soccer Practice",
    time: "3:30 PM",
    date: fmt(today),
    color: "#84CC16",
    icon: "ri-football-line",
  },
  {
    id: "2",
    title: "Piano Lesson",
    time: "4:30 PM",
    date: fmt(today),
    color: "#8B5CF6",
    icon: "ri-music-line",
  },
  {
    id: "3",
    title: "Family Movie Night",
    time: "7:00 PM",
    date: fmt(today),
    color: "#E5A00D",
    icon: "ri-movie-line",
  },
  {
    id: "4",
    title: "Dentist — Emma",
    time: "10:00 AM",
    date: fmt(tomorrow),
    color: "#06B6D4",
    icon: "ri-heart-pulse-line",
  },
  {
    id: "5",
    title: "Grocery Run",
    time: "2:00 PM",
    date: fmt(tomorrow),
    color: "#F59E0B",
    icon: "ri-shopping-cart-line",
  },
  {
    id: "6",
    title: "Game Night",
    time: "6:00 PM",
    date: fmt(dayAfter),
    color: "#F43F5E",
    icon: "ri-gamepad-line",
  },
]
