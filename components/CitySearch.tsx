'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const POPULAR_CITIES = [
  { city: 'Miami', emoji: '🌴', country: 'USA' },
  { city: 'Tokyo', emoji: '🗼', country: 'Japan' },
  { city: 'Barcelona', emoji: '🎨', country: 'Spain' },
  { city: 'Paris', emoji: '🥐', country: 'France' },
  { city: 'Sydney', emoji: '🦘', country: 'Australia' },
  { city: 'New York', emoji: '🗽', country: 'USA' },
  { city: 'London', emoji: '☂️', country: 'UK' },
  { city: 'Amsterdam', emoji: '🚲', country: 'Netherlands' },
  { city: 'Lisbon', emoji: '🛵', country: 'Portugal' },
  { city: 'Dubai', emoji: '🏙️', country: 'UAE' },
  { city: 'Singapore', emoji: '🦁', country: 'Singapore' },
  { city: 'Rome', emoji: '🍕', country: 'Italy' },
  { city: 'Berlin', emoji: '🎵', country: 'Germany' },
  { city: 'Seoul', emoji: '🎎', country: 'South Korea' },
  { city: 'Istanbul', emoji: '🕌', country: 'Turkey' },
  { city: 'Bangkok', emoji: '🐘', country: 'Thailand' },
  { city: 'Los Angeles', emoji: '🌅', country: 'USA' },
  { city: 'Chicago', emoji: '🌬️', country: 'USA' },
  { city: 'Toronto', emoji: '🍁', country: 'Canada' },
  { city: 'Mexico City', emoji: '🌮', country: 'Mexico' },
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search any city in the world..."
            className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none shadow-lg bg-white transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-medium transition-colors"
          >
            Scout it
          </button>
        </div>
      </form>

      {focused && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {suggestions.map(({ city, emoji, country }) => (
            <button
              key={city}
              onMouseDown={() => navigate(city)}
              className="w-full text-left px-4 py-3 hover:bg-teal-50 flex items-center gap-3 transition-colors"
            >
              <span className="text-xl">{emoji}</span>
              <div>
                <div className="font-medium text-gray-900">{city}</div>
                <div className="text-sm text-gray-500">{country}</div>
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
          className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition-all shadow-sm text-sm font-medium text-gray-700 group"
        >
          <span className="group-hover:scale-110 transition-transform">{emoji}</span>
          {city}
        </button>
      ))}
    </div>
  )
}
