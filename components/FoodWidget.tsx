'use client'
import { Star, ExternalLink, UtensilsCrossed } from 'lucide-react'
import { Restaurant } from '@/lib/types'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function FoodWidget({ restaurants, city }: { restaurants: Restaurant[]; city: string }) {
  if (restaurants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center">
        <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 text-amber-300" />
        <p className="text-sm font-semibold text-gray-700 mb-1">No food data yet</p>
        <p className="text-xs text-gray-400">Add a <span className="font-mono">YELP_API_KEY</span> or <span className="font-mono">FOURSQUARE_API_KEY</span> to see Bao&apos;s top picks for {city}.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-50 flex items-center gap-2">
        <span className="text-xl">🍜</span>
        <h3 className="font-bold text-gray-900">Bao&apos;s Food Hotspots</h3>
        <span className="ml-auto text-xs text-gray-400">via Yelp · Foursquare</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-amber-50">
        {restaurants.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-amber-50/30 transition-colors">
            {r.imageUrl ? (
              <img
                src={r.imageUrl}
                alt={r.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FFF5ED, #FFEDD5)' }}>
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 text-sm truncate hover:underline"
                >
                  {r.name}
                </a>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" style={{ color: '#C8281A' }}>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-xs text-gray-500 mb-1.5 truncate">{r.cuisine} · {r.priceLevel}</div>
              <div className="flex items-center gap-2">
                <StarRating rating={r.rating} />
                <span className="text-xs text-gray-400">({r.reviewCount.toLocaleString()})</span>
                <a
                  href={`https://www.ubereats.com/search?q=${encodeURIComponent(r.name + ' ' + city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  🛵 UberEats
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
