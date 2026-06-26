'use client'
import { ExternalLink, Calendar } from 'lucide-react'
import { Event } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  Music: 'bg-purple-100 text-purple-700',
  Sports: 'bg-green-100 text-green-700',
  Arts: 'bg-pink-100 text-pink-700',
  Cultural: 'bg-amber-100 text-amber-700',
  Festival: 'bg-orange-100 text-orange-700',
  Fashion: 'bg-rose-100 text-rose-700',
  'Food & Drink': 'bg-lime-100 text-lime-700',
  Market: 'bg-cyan-100 text-cyan-700',
  Entertainment: 'bg-blue-100 text-blue-700',
}

const EVENT_SITES = [
  { name: 'Ticketmaster', emoji: '🎟️', color: 'border-blue-200 text-blue-700 hover:bg-blue-50', href: (city: string) => `https://www.ticketmaster.com/search?q=${encodeURIComponent(city)}` },
  { name: 'Eventbrite', emoji: '🎪', color: 'border-orange-200 text-orange-700 hover:bg-orange-50', href: (city: string) => `https://www.eventbrite.com/d/${encodeURIComponent(city.toLowerCase().replace(/ /g, '-'))}/events/` },
  { name: 'Google Events', emoji: '📅', color: 'border-green-200 text-green-700 hover:bg-green-50', href: (city: string) => `https://www.google.com/search?q=events+in+${encodeURIComponent(city)}&ibp=htl;events` },
  { name: 'Meetup', emoji: '👥', color: 'border-red-200 text-red-700 hover:bg-red-50', href: (city: string) => `https://www.meetup.com/find/?location=${encodeURIComponent(city)}&source=EVENTS` },
]

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function EventsWidget({ events, city }: { events: Event[]; city: string }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-50 flex items-center gap-2">
        <Calendar className="w-5 h-5" style={{ color: '#C8281A' }} />
        <h3 className="font-bold text-gray-900">Upcoming Events</h3>
        {events.length > 0 && <span className="ml-auto text-xs text-gray-400">via Ticketmaster · Eventbrite</span>}
      </div>

      {events.length > 0 && (
        <div className="divide-y divide-amber-50">
          {events.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-4 hover:bg-amber-50/30 transition-colors group">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFF5ED, #FFEDD5)' }}>
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{event.name}</div>
                  <a href={event.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0" style={{ color: '#C8281A' }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatDate(event.date)} • {event.venue}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-600'}`}>
                    {event.category}
                  </span>
                  {event.priceRange && <span className="text-xs text-gray-400">{event.priceRange}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always show event site links */}
      <div className="p-4 border-t border-amber-50">
        <p className="text-xs text-gray-400 mb-3">Find events happening in {city}:</p>
        <div className="grid grid-cols-2 gap-2">
          {EVENT_SITES.map(site => (
            <a key={site.name} href={site.href(city)} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${site.color}`}>
              <span>{site.emoji}</span> {site.name} <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
