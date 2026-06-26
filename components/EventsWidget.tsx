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
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-amber-300" />
        <p className="text-sm font-semibold text-gray-700 mb-1">No events data yet</p>
        <p className="text-xs text-gray-400">Add a <span className="font-mono">TICKETMASTER_API_KEY</span> or <span className="font-mono">EVENTBRITE_API_KEY</span> to see what&apos;s on in {city}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-50 flex items-center gap-2">
        <Calendar className="w-5 h-5" style={{ color: '#C8281A' }} />
        <h3 className="font-bold text-gray-900">Upcoming Events</h3>
        <span className="ml-auto text-xs text-gray-400">via Ticketmaster · Eventbrite</span>
      </div>

      <div className="divide-y divide-amber-50">
        {events.map(event => (
          <a
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 hover:bg-amber-50/30 transition-colors group"
          >
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
                <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-red-700 transition-colors">{event.name}</div>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-gray-300 group-hover:text-red-400 transition-colors mt-0.5" />
              </div>
              <div className="text-xs text-gray-500 mt-1">{formatDate(event.date)} · {event.venue}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-600'}`}>
                  {event.category}
                </span>
                {event.priceRange && <span className="text-xs text-gray-400">{event.priceRange}</span>}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
