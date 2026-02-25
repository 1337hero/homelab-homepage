import Navbar from "@/components/layouts/Navbar"

export default function MainLayout({ children }) {
  return (
    <div class="homepage-bg min-h-screen font-nunito">
      <Navbar />
      <main class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        {children}
      </main>
      <footer class="text-center py-6">
        <p class="font-nunito text-sm text-brown-300">
          Built with <span class="text-red-400">&#9829;</span> for the family
        </p>
      </footer>
    </div>
  )
}
