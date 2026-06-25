'use client'
import { usePreferences } from '@/store/usePreferences'
import { UserPreferences } from '@/lib/types'
import { SlidersHorizontal } from 'lucide-react'

interface ToggleProps {
  label: string
  emoji: string
  value: boolean
  onChange: (v: boolean) => void
}

function Toggle({ label, emoji, value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
        value
          ? 'bg-red-700 text-white border-red-700 font-medium'
          : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  )
}

export default function PreferencesSidebar() {
  const { preferences: prefs, setPreference } = usePreferences()

  function setPref<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPreference(key, value)
  }

  const features: Array<{ key: keyof UserPreferences; label: string; emoji: string }> = [
    { key: 'naturalLight', label: 'Natural Light', emoji: '☀️' },
    { key: 'highFloor', label: 'High Floor', emoji: '🏙️' },
    { key: 'oceanView', label: 'Ocean View', emoji: '🌊' },
    { key: 'cityView', label: 'City View', emoji: '🌃' },
    { key: 'mountainView', label: 'Mountain View', emoji: '⛰️' },
    { key: 'modern', label: 'Modern', emoji: '✨' },
    { key: 'historic', label: 'Historic', emoji: '🏛️' },
    { key: 'balcony', label: 'Balcony', emoji: '🌿' },
    { key: 'rooftop', label: 'Rooftop', emoji: '🏗️' },
    { key: 'gym', label: 'Gym', emoji: '🏋️' },
    { key: 'pool', label: 'Pool', emoji: '🏊' },
    { key: 'petFriendly', label: 'Pet Friendly', emoji: '🐾' },
    { key: 'parking', label: 'Parking', emoji: '🚗' },
    { key: 'inUnitLaundry', label: 'Laundry', emoji: '🫧' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-4 h-4 text-red-700" />
        <h3 className="font-semibold text-gray-900 text-sm">Filter Listings</h3>
      </div>

      {/* Bedrooms */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">Bedrooms</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPref('bedrooms', Math.max(0, prefs.bedrooms - 1))}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
          >
            -
          </button>
          <span className="w-8 text-center font-medium text-gray-900">{prefs.bedrooms === 0 ? 'Any' : prefs.bedrooms}</span>
          <button
            onClick={() => setPref('bedrooms', prefs.bedrooms + 1)}
            className="w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Listing type */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">Listing Type</label>
        <div className="flex gap-2">
          {(['both', 'buy', 'rent'] as const).map(t => (
            <button
              key={t}
              onClick={() => setPref('listingType', t)}
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-all capitalize ${
                prefs.listingType === t
                  ? 'bg-red-700 text-white border-red-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-amber-300'
              }`}
            >
              {t === 'both' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block">Max Price</label>
        <select
          value={prefs.maxPrice || ''}
          onChange={e => setPref('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-amber-400"
        >
          <option value="">No max</option>
          <option value="500000">$500K</option>
          <option value="1000000">$1M</option>
          <option value="2000000">$2M</option>
          <option value="5000000">$5M</option>
          <option value="10000000">$10M+</option>
        </select>
      </div>

      {/* Feature toggles */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-2 block">Must-Have Features</label>
        <div className="flex flex-wrap gap-2">
          {features.map(({ key, label, emoji }) => (
            <Toggle
              key={key}
              label={label}
              emoji={emoji}
              value={Boolean(prefs[key])}
              onChange={v => setPref(key, v as UserPreferences[typeof key])}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
