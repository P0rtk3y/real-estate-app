import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchListings } from '@/lib/api/listings'
import { fetchWeather } from '@/lib/api/weather'
import { fetchEvents } from '@/lib/api/events'
import { fetchFood } from '@/lib/api/food'
import { fetchInsights } from '@/lib/api/insights'
import { DEFAULT_PREFERENCES, CITY_EMOJIS, CITY_PORTALS } from '@/lib/types'
import ScoutReport from '@/components/ScoutReport'
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
            {/* Scout Report with neighborhood listings + portals */}
            {resolvedInsight && (
              <ScoutReport
                city={cityName}
                insight={resolvedInsight}
                listings={resolvedListings}
                portals={CITY_PORTALS[cityName.toLowerCase()] || []}
              />
            )}

            {/* Weather + Events row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resolvedWeather && <WeatherWidget weather={resolvedWeather} />}
              <EventsWidget events={resolvedEvents} city={cityName} />
            </div>

            {/* Food */}
            <FoodWidget restaurants={resolvedFood} city={cityName} />
          </div>
        </div>
      </div>
    </div>
  )
}
