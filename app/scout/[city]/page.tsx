import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchListings } from '@/lib/api/listings'
import { fetchWeather } from '@/lib/api/weather'
import { fetchEvents } from '@/lib/api/events'
import { fetchFood } from '@/lib/api/food'
import { fetchInsights } from '@/lib/api/insights'
import { DEFAULT_PREFERENCES, CITY_EMOJIS, CITY_PORTALS } from '@/lib/types'
import ScoutReport from '@/components/ScoutReport'
import ListingCard from '@/components/ListingCard'
import WeatherWidget from '@/components/WeatherWidget'
import EventsWidget from '@/components/EventsWidget'
import FoodWidget from '@/components/FoodWidget'
import PreferencesSidebar from '@/components/PreferencesSidebar'
import AddAlertButton from '@/components/AddAlertButton'

interface Props {
  params: Promise<{ city: string }>
}

function formatCityName(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params
  const cityName = formatCityName(city)
  return {
    title: `${cityName} — Scouted by Bao | BaoScout`,
    description: `Bao's real estate report on ${cityName}: cultural insights, weather, events, food, and beautiful properties.`,
  }
}

export default async function ScoutPage({ params }: Props) {
  const { city: citySlug } = await params
  if (!citySlug) notFound()

  const cityName = formatCityName(decodeURIComponent(citySlug))
  const cityEmoji = CITY_EMOJIS[cityName.toLowerCase()] || CITY_EMOJIS['default']

  const [listings, weather, events, food, insight] = await Promise.allSettled([
    fetchListings(cityName, DEFAULT_PREFERENCES),
    fetchWeather(cityName),
    fetchEvents(cityName),
    fetchFood(cityName),
    fetchInsights(cityName, DEFAULT_PREFERENCES),
  ])

  const resolvedListings = listings.status === 'fulfilled' ? listings.value : []
  const resolvedWeather = weather.status === 'fulfilled' ? weather.value : null
  const resolvedEvents = events.status === 'fulfilled' ? events.value : []
  const resolvedFood = food.status === 'fulfilled' ? food.value : []
  const resolvedInsight = insight.status === 'fulfilled' ? insight.value : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* City header */}
      <div className="text-white py-10 px-4" style={{ background: 'linear-gradient(135deg, #C8281A 0%, #9B3012 40%, #5C1F0A 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                  <span className="text-5xl">{cityEmoji}</span>
                  <span className="absolute -top-1 -right-1 text-lg">🌸</span>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black">{cityName}</h1>
                  <p className="text-white/70 text-sm mt-0.5">
                    Bao has scouted · {resolvedListings.length} properties · culture, weather &amp; homes
                  </p>
                </div>
              </div>
            </div>
            <AddAlertButton city={cityName} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <Suspense fallback={<div className="h-96 bg-white rounded-2xl animate-pulse" />}>
              <PreferencesSidebar />
            </Suspense>
          </div>

          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Scout Report */}
            {resolvedInsight && (
              <ScoutReport city={cityName} insight={resolvedInsight} />
            )}

            {/* Weather + Events row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resolvedWeather && <WeatherWidget weather={resolvedWeather} />}
              <EventsWidget events={resolvedEvents} city={cityName} />
            </div>

            {/* Food */}
            <FoodWidget restaurants={resolvedFood} city={cityName} />

            {/* Listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Properties in {cityName}
                </h2>
                <p className="text-sm text-gray-500">
                  {resolvedListings.length > 0
                    ? `Sorted by Scout Score · via ${resolvedListings[0].source}`
                    : 'Verified local sources only'}
                </p>
              </div>

              {resolvedListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {resolvedListings
                    .sort((a, b) => (b.scoutScore ?? 0) - (a.scoutScore ?? 0))
                    .map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-amber-100 p-10 text-center">
                  <div className="text-5xl mb-4">🏡</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse verified local listings</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">Bao only shows properties from trusted local portals. Use the links below to search directly on the sites locals use.</p>
                </div>
              )}
            </div>

            {/* Local portals */}
            {(() => {
              const portals = CITY_PORTALS[cityName.toLowerCase()]
              if (!portals?.length) return null
              return (
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span>🏦</span> Also Search on Verified Local Portals
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Country-specific real estate sites trusted by locals — often have listings not found elsewhere.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {portals.map(portal => (
                      <a
                        key={portal.name}
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all group"
                      >
                        <span className="text-2xl flex-shrink-0">{portal.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 group-hover:text-red-700 transition-colors">{portal.name}</div>
                          <div className="text-xs text-gray-500 truncate">{portal.description}</div>
                        </div>
                        <span className="text-gray-300 group-hover:text-red-400 transition-colors text-xs">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Source disclaimer */}
            <div className="rounded-xl p-4 text-sm" style={{ background: '#FFF5ED', border: '1px solid #FDBA74', color: '#7C2D12' }}>
              <strong>Important:</strong> BaoScout is a search assistant only — always verify listing details, pricing,
              and availability with a licensed real estate agent before making any property decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
