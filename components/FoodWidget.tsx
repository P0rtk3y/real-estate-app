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

const FOOD_APPS = [
  { name: 'UberEats', emoji: '🛵', color: 'border-black text-black hover:bg-gray-50', href: (city: string) => `https://www.ubereats.com/search?q=restaurants+${encodeURIComponent(city)}` },
  { name: 'Yelp', emoji: '⭐', color: 'border-red-200 text-red-700 hover:bg-red-50', href: (city: string) => `https://www.yelp.com/search?find_desc=restaurants&find_loc=${encodeURIComponent(city)}` },
  { name: 'Google Maps', emoji: '📍', color: 'border-blue-200 text-blue-700 hover:bg-blue-50', href: (city: string) => `https://www.google.com/maps/search/restaurants+in+${encodeURIComponent(city)}` },
  { name: 'DoorDash', emoji: '🚪', color: 'border-orange-200 text-orange-700 hover:bg-orange-50', href: (city: string) => `https://www.doordash.com/search/store/${encodeURIComponent(city)}/` },
]

export default function FoodWidget({ restaurants, city }: { restaurants: Restaurant[]; city: string }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-50 flex items-center gap-2">
        <span className="text-xl">🍜</span>
        <h3 className="font-bold text-gray-900">Bao&apos;s Food Hotspots</h3>
        {restaurants.length > 0 && <span className="ml-auto text-xs text-gray-400">via Yelp · Foursquare</span>}
      </div>

      {restaurants.length > 0 && (
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
                <div className="flex items-center justify-between gap-1">
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="font-semibold text-gray-900 text-sm truncate hover:underline">
                    {r.name}
                  </a>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#C8281A' }} className="flex-shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-xs text-gray-500 mb-1 truncate">{r.cuisine}</div>
                <div className="flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-xs text-gray-400">({r.reviewCount.toLocaleString()})</span>
                  <span className="text-xs font-medium text-gray-500">{r.priceLevel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always show order/find links */}
      <div className="p-4 border-t border-amber-50">
        <p className="text-xs text-gray-400 mb-3">Order delivery or find more restaurants in {city}:</p>
        <div className="grid grid-cols-2 gap-2">
          {FOOD_APPS.map(app => (
            <a key={app.name} href={app.href(city)} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${app.color}`}>
              <span>{app.emoji}</span> {app.name} <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
