'use client'
import { useState } from 'react'
import { Heart, ExternalLink, Bed, Bath, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Listing, FEATURE_LABELS } from '@/lib/types'

interface Props {
  listing: Listing
}

function ScoutScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : score >= 60 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className={`absolute top-3 left-3 border rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}% match
    </div>
  )
}

export default function ListingCard({ listing }: Props) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [saved, setSaved] = useState(false)
  const photos = listing.photos.length > 0 ? listing.photos : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80']

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length)
  }
  function next(e: React.MouseEvent) {
    e.preventDefault()
    setPhotoIndex(i => (i + 1) % photos.length)
  }

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault()
    setSaved(!saved)
    if (!saved) {
      await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, city: listing.city, data: listing }),
      }).catch(() => {})
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
      {/* Photo */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={photos[photoIndex]}
          alt={listing.address}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80' }}
        />

        {listing.scoutScore !== undefined && <ScoutScoreBadge score={listing.scoutScore} />}

        <button
          onClick={toggleSave}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
        </button>

        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1 rounded-full transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1 rounded-full transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {listing.source}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xl font-bold text-gray-900">{listing.priceDisplay}</div>
            <div className="text-xs text-gray-500 mt-0.5">{listing.listingType === 'rent' ? '/month' : 'for sale'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 capitalize">{listing.propertyType}</div>
            {listing.yearBuilt && <div className="text-xs text-gray-400">Built {listing.yearBuilt}</div>}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-1">{listing.address}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {listing.beds > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-teal-500" />
              <span>{listing.beds} {listing.beds === 1 ? 'bed' : 'beds'}</span>
            </div>
          )}
          {listing.baths > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-teal-500" />
              <span>{listing.baths} {listing.baths === 1 ? 'bath' : 'baths'}</span>
            </div>
          )}
          {listing.sqft > 0 && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4 text-teal-500" />
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Features */}
        {listing.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.features.slice(0, 5).map(f => (
              <span
                key={f}
                title={FEATURE_LABELS[f]?.label}
                className="text-base"
              >
                {FEATURE_LABELS[f]?.emoji}
              </span>
            ))}
            {listing.features.length > 5 && (
              <span className="text-xs text-gray-400 self-center">+{listing.features.length - 5} more</span>
            )}
          </div>
        )}

        {listing.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{listing.description}</p>
        )}

        <a
          href={listing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          View on {listing.source}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}
