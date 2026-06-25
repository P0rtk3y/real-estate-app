'use client'
import { usePreferences } from '@/store/usePreferences'
import { UserPreferences } from '@/lib/types'
import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">{title}</h2>
      {children}
    </div>
  )
}

interface ToggleRowProps {
  label: string
  description?: string
  emoji: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, emoji, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl w-7">{emoji}</span>
        <div>
          <div className="font-medium text-gray-900 text-sm">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-red-700' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function PreferencesPage() {
  const { preferences: prefs, setPreference, reset, saveToServer } = usePreferences()
  const [saved, setSaved] = useState(false)

  function setPref<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    setPreference(key, value)
    setSaved(false)
  }

  async function handleSave() {
    await saveToServer()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const PROPERTY_TYPES = ['apartment', 'condo', 'house', 'townhouse', 'villa', 'loft']

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌸 My Preferences</h1>
          <p className="text-gray-500 text-sm mt-1">&quot;Tell Lan what you want and she will find it — or tell you honestly that it doesn&apos;t exist!&quot;</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { reset(); setSaved(false) }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Listing Basics */}
      <Section title="Listing Basics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Bedrooms */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Bedrooms</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPref('bedrooms', Math.max(0, prefs.bedrooms - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                {prefs.bedrooms === 0 ? 'Any' : prefs.bedrooms === 6 ? '5+' : prefs.bedrooms}
              </span>
              <button
                onClick={() => setPref('bedrooms', Math.min(6, prefs.bedrooms + 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Bathrooms</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPref('bathrooms', Math.max(0, prefs.bathrooms - 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 text-lg">
                {prefs.bathrooms === 0 ? 'Any' : prefs.bathrooms}
              </span>
              <button
                onClick={() => setPref('bathrooms', prefs.bathrooms + 1)}
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Min Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Min Price</label>
            <select
              value={prefs.minPrice || ''}
              onChange={e => setPref('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="">No minimum</option>
              <option value="100000">$100K</option>
              <option value="250000">$250K</option>
              <option value="500000">$500K</option>
              <option value="750000">$750K</option>
              <option value="1000000">$1M</option>
              <option value="2000000">$2M</option>
              <option value="5000000">$5M</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Max Price</label>
            <select
              value={prefs.maxPrice || ''}
              onChange={e => setPref('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="">No maximum</option>
              <option value="500000">$500K</option>
              <option value="1000000">$1M</option>
              <option value="2000000">$2M</option>
              <option value="5000000">$5M</option>
              <option value="10000000">$10M</option>
            </select>
          </div>

          {/* Min Sqft */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Min Square Footage</label>
            <select
              value={prefs.minSqft || ''}
              onChange={e => setPref('minSqft', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-amber-400"
            >
              <option value="">No minimum</option>
              <option value="400">400 sqft</option>
              <option value="600">600 sqft</option>
              <option value="800">800 sqft</option>
              <option value="1000">1,000 sqft</option>
              <option value="1500">1,500 sqft</option>
              <option value="2000">2,000 sqft</option>
              <option value="3000">3,000 sqft</option>
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Listing Type</label>
            <div className="flex gap-2">
              {(['both', 'buy', 'rent'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPref('listingType', t)}
                  className={`flex-1 py-2.5 text-sm rounded-xl border capitalize transition-all ${
                    prefs.listingType === t
                      ? 'bg-red-700 text-white border-red-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {t === 'both' ? 'All' : t === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Property Types */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">Property Types (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(type => {
              const selected = prefs.propertyTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => {
                    const next = selected
                      ? prefs.propertyTypes.filter(t => t !== type)
                      : [...prefs.propertyTypes, type]
                    setPref('propertyTypes', next)
                  }}
                  className={`px-4 py-2 rounded-xl text-sm border capitalize transition-all ${
                    selected
                      ? 'bg-red-700 text-white border-red-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Property Features */}
      <Section title="Property Features">
        <ToggleRow label="Natural Light" description="South/East-facing, large windows" emoji="☀️" value={prefs.naturalLight} onChange={v => setPref('naturalLight', v)} />
        <ToggleRow label="High Floor" description="Elevated position, above street level" emoji="🏙️" value={prefs.highFloor} onChange={v => setPref('highFloor', v)} />
        {prefs.highFloor && (
          <div className="ml-10 mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Minimum floor</label>
            <input
              type="number"
              min={2}
              max={100}
              value={prefs.minFloor || ''}
              onChange={e => setPref('minFloor', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 10"
              className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
        <ToggleRow label="Ocean / Water View" description="Views of sea, bay, lake, or river" emoji="🌊" value={prefs.oceanView} onChange={v => setPref('oceanView', v)} />
        <ToggleRow label="City View / Skyline" description="Urban landscape panorama" emoji="🌃" value={prefs.cityView} onChange={v => setPref('cityView', v)} />
        <ToggleRow label="Mountain View" description="Views of hills or mountains" emoji="⛰️" value={prefs.mountainView} onChange={v => setPref('mountainView', v)} />
        <ToggleRow label="Modern Finishes" description="Renovated, contemporary design" emoji="✨" value={prefs.modern} onChange={v => setPref('modern', v)} />
        <ToggleRow label="Historic Character" description="Period details, classic architecture" emoji="🏛️" value={prefs.historic} onChange={v => setPref('historic', v)} />
        <ToggleRow label="Balcony / Terrace" description="Private outdoor space" emoji="🌿" value={prefs.balcony} onChange={v => setPref('balcony', v)} />
        <ToggleRow label="Rooftop Access" description="Shared or private roof deck" emoji="🏗️" value={prefs.rooftop} onChange={v => setPref('rooftop', v)} />
        <ToggleRow label="Gym / Fitness Center" description="In-building workout facility" emoji="🏋️" value={prefs.gym} onChange={v => setPref('gym', v)} />
        <ToggleRow label="Pool" description="Swimming pool access" emoji="🏊" value={prefs.pool} onChange={v => setPref('pool', v)} />
        <ToggleRow label="Concierge / Doorman" description="Front desk or door services" emoji="🛎️" value={prefs.concierge} onChange={v => setPref('concierge', v)} />
        <ToggleRow label="Pet Friendly" description="Allows cats and/or dogs" emoji="🐾" value={prefs.petFriendly} onChange={v => setPref('petFriendly', v)} />
        <ToggleRow label="Parking Included" description="Deeded or assigned parking" emoji="🚗" value={prefs.parking} onChange={v => setPref('parking', v)} />
        <ToggleRow label="Storage" description="Additional storage unit" emoji="📦" value={prefs.storage} onChange={v => setPref('storage', v)} />
        <ToggleRow label="In-Unit Laundry" description="Washer/dryer inside the unit" emoji="🫧" value={prefs.inUnitLaundry} onChange={v => setPref('inUnitLaundry', v)} />
      </Section>

      {/* Lifestyle */}
      <Section title="Neighborhood & Lifestyle">
        <ToggleRow label="High Walkability" description="Most errands on foot" emoji="🚶" value={prefs.walkability} onChange={v => setPref('walkability', v)} />
        <ToggleRow label="Transit Access" description="Close to metro, bus, or train" emoji="🚇" value={prefs.transitAccess} onChange={v => setPref('transitAccess', v)} />
        <ToggleRow label="Bike-Friendly" description="Bike lanes and infrastructure" emoji="🚲" value={prefs.bikeFriendly} onChange={v => setPref('bikeFriendly', v)} />
        <ToggleRow label="Near Restaurants / Nightlife" description="Dining and entertainment nearby" emoji="🍽️" value={prefs.nearRestaurants} onChange={v => setPref('nearRestaurants', v)} />
        <ToggleRow label="Near Parks / Nature" description="Green space and outdoor recreation" emoji="🌳" value={prefs.nearParks} onChange={v => setPref('nearParks', v)} />
        <ToggleRow label="Near Top Schools" description="Good school district or international schools" emoji="🏫" value={prefs.nearSchools} onChange={v => setPref('nearSchools', v)} />
        <ToggleRow label="Quiet Neighborhood" description="Low traffic, residential character" emoji="🌙" value={prefs.quietNeighborhood} onChange={v => setPref('quietNeighborhood', v)} />
        <ToggleRow label="Up-and-Coming Area" description="Emerging neighborhood with upside" emoji="📈" value={prefs.upAndComing} onChange={v => setPref('upAndComing', v)} />
      </Section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-red-700 hover:bg-red-800 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Preferences Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
