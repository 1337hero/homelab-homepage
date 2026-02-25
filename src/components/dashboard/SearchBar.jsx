export default function SearchBar({ value, onInput, onClear }) {
  return (
    <section
      class="animate-bounce-in max-w-xl mx-auto mb-10"
      style={{ animationDelay: "0.2s" }}
    >
      <div class="relative">
        <i
          class="ri-search-line absolute left-5 top-1/2 -translate-y-1/2 text-xl text-brown-300"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="What are you looking for?"
          value={value}
          onInput={onInput}
          class="search-focus w-full pl-14 pr-5 py-4 rounded-2xl bg-white border-2 border-border
                 font-nunito text-lg text-brown-800 placeholder-brown-300
                 outline-none transition-all duration-200"
        />
        {value && (
          <button
            onClick={onClear}
            class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                   bg-border hover:bg-border-hover flex items-center justify-center
                   transition-colors"
            aria-label="Clear search"
          >
            <i class="ri-close-line text-brown-600" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
