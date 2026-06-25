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

export default function FoodWidget({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-amber-50 flex items-center gap-2">
        <span className="text-xl">🥖</span>
        <h3 className="font-bold text-gray-900">Bao&apos;s Food Hotspots</h3>
        <span className="ml-auto text-xs text-gray-400">via Yelp</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-amber-50">
        {restaurants.map(r => (
          <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-amber-50/30 transition-colors group">
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
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900 text-sm truncate">{r.name}</div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                  style={{ color: '#C8281A' }}
                >
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

      {restaurants.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No restaurants found</p>
        </div>
      )}
    </div>
  )
}
