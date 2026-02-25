import { Component } from "preact"

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div class="min-h-screen flex items-center justify-center bg-cream">
          <div class="text-center p-8">
            <div class="text-5xl mb-4">😵</div>
            <h1 class="font-fredoka text-2xl font-semibold text-brown-800 mb-2">
              Something went wrong
            </h1>
            <p class="font-nunito text-brown-500 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              class="px-6 py-2 rounded-2xl bg-brown-700 text-white font-nunito font-semibold hover:bg-brown-800 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
