'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const POPULAR_CITIES = [
  // Focus regions: Finland, Greece & Italy
  { city: 'Helsinki', emoji: '❄️', country: 'Finland' },
  { city: 'Athens', emoji: '🏛️', country: 'Greece' },
  { city: 'Rome', emoji: '🍕', country: 'Italy' },
  { city: 'Florence', emoji: '🎭', country: 'Italy' },
  { city: 'Santorini', emoji: '🏖️', country: 'Greece' },
  { city: 'Milan', emoji: '👗', country: 'Italy' },
  // Other great cities
  { city: 'Tokyo', emoji: '🗼', country: 'Japan' },
  { city: 'Barcelona', emoji: '🎨', country: 'Spain' },
  { city: 'Paris', emoji: '🥐', country: 'France' },
  { city: 'Sydney', emoji: '🦘', country: 'Australia' },
  { city: 'London', emoji: '☂️', country: 'UK' },
  { city: 'Amsterdam', emoji: '🚲', country: 'Netherlands' },
  { city: 'Lisbon', emoji: '🛵', country: 'Portugal' },
  { city: 'Dubai', emoji: '🏙️', country: 'UAE' },
  { city: 'Singapore', emoji: '🦁', country: 'Singapore' },
  { city: 'Berlin', emoji: '🎵', country: 'Germany' },
  { city: 'Seoul', emoji: '🎎', country: 'South Korea' },
  { city: 'Istanbul', emoji: '🕌', country: 'Turkey' },
  { city: 'Bangkok', emoji: '🐘', country: 'Thailand' },
  { city: 'Toronto', emoji: '🍁', country: 'Canada' },
]

export default function CitySearch() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<typeof POPULAR_CITIES>([])
  const [focused, setFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length > 0) {
      const filtered = POPULAR_CITIES.filter(c =>
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 6))
    } else {
      setSuggestions([])
    }
  }, [query])

  function navigate(city: string) {
    router.push(`/scout/${encodeURIComponent(city.toLowerCase().replace(/ /g, '-'))}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(query.trim())
  }

  return (
    <div className="w-full max-w-2xl relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search any city in the world..."
            className="w-full pl-12 pr-28 py-4 text-base sm:text-lg rounded-2xl border-2 border-transparent focus:outline-none shadow-lg bg-white transition-all"
            style={{ borderColor: focused ? '#C8281A' : 'transparent' }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity active:opacity-80"
            style={{ background: 'linear-gradient(135deg, #C8281A, #9B3012)' }}
          >
            Scout it
          </button>
        </div>
      </form>

      {focused && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden z-50">
          {suggestions.map(({ city, emoji, country }) => (
            <button
              key={city}
              onMouseDown={() => navigate(city)}
              className="w-full text-left px-4 py-3.5 hover:bg-amber-50 flex items-center gap-3 transition-colors active:bg-amber-100"
            >
              <span className="text-xl">{emoji}</span>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{city}</div>
                <div className="text-xs text-gray-500">{country}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function PopularCities() {
  const router = useRouter()

  function navigate(city: string) {
    router.push(`/scout/${encodeURIComponent(city.toLowerCase().replace(/ /g, '-'))}`)
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
      {POPULAR_CITIES.slice(0, 12).map(({ city, emoji }) => (
        <button
          key={city}
          onClick={() => navigate(city)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white rounded-full border border-amber-100 hover:border-amber-400 hover:bg-amber-50 transition-all shadow-sm text-sm font-semibold text-gray-700 group active:scale-95"
        >
          <span className="group-hover:scale-110 transition-transform">{emoji}</span>
          {city}
        </button>
      ))}
    </div>
  )
}
