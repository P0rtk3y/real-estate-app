'use client'
import { useState } from 'react'
import { ScoutInsight, Listing, CityPortal } from '@/lib/types'
import { MapPin, Lightbulb, Utensils, Cloud, ExternalLink, Search } from 'lucide-react'
import ListingCard from '@/components/ListingCard'

interface Props {
  city: string
  insight: ScoutInsight
  listings: Listing[]
  portals: CityPortal[]
}

function neighborhoodSearchLinks(name: string, city: string, portals: CityPortal[]) {
  const q = encodeURIComponent(`${name} ${city}`)
  const links = [
    { label: 'Zillow', href: `https://www.zillow.com/homes/${encodeURIComponent(name + ' ' + city)}_rb/`, color: 'border-blue-200 text-blue-700 hover:bg-blue-50' },
    { label: 'Realtor.com', href: `https://www.realtor.com/realestateandhomes-search/${encodeURIComponent(city)}/?neighborhoods=${encodeURIComponent(name)}`, color: 'border-red-200 text-red-700 hover:bg-red-50' },
    { label: 'Google Maps', href: `https://www.google.com/maps/search/apartments+${q}`, color: 'border-green-200 text-green-700 hover:bg-green-50' },
    ...portals.slice(0, 1).map(p => ({
      label: p.name, href: p.url, color: 'border-amber-200 text-amber-700 hover:bg-amber-50'
    })),
  ]
  return links
}

export default function ScoutReport({ city, insight, listings, portals }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const medals = ['🥇', '🥈', '🥉', '🌿', '✨']

  function getNeighborhoodListings(name: string): Listing[] {
    const lower = name.toLowerCase()
    return listings.filter(l =>
      (l.address || '').toLowerCase().includes(lower) ||
      (l.description || '').toLowerCase().includes(lower)
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 text-white" style={{ background: 'linear-gradient(135deg, #C8281A 0%, #9B3012 40%, #5C1F0A 100%)' }}>
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src="/images/lan-avatar.png"
              alt="Bao"
              className="w-16 h-16 object-contain drop-shadow-md"
              onError={e => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                const fb = document.createElement('div')
                fb.textContent = '🏠'
                fb.className = 'text-5xl'
                img.parentNode?.insertBefore(fb, img)
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-xl" style={{ color: '#FFD700' }}>Bao&apos;s Scout Report</span>
              <span className="text-white/60">·</span>
              <span className="font-bold text-white/90">{city}</span>
              <span className="text-2xl">{insight.emoji}</span>
            </div>
            <p className="text-white/75 text-sm">
              Bao has scouted this city so you don&apos;t have to 🛵✨
            </p>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#FFD700' }}>
            Bao&apos;s Verdict
          </div>
          <p className="text-white font-medium italic leading-relaxed">&quot;{insight.verdict}&quot;</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Cultural flavor */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: '#C8281A' }} />
            The Vibe
            <span className="text-sm font-normal text-gray-400">— according to Bao</span>
          </h3>
          <div className="text-sm text-gray-700 space-y-3">
            {insight.culturalFlavor.split('\n\n').map((p, i) => (
              <p key={i} className="leading-relaxed">{p}</p>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Bao&apos;s Scout Tips
          </h3>
          <ul className="space-y-3">
            {insight.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #C8281A, #9B3012)' }}>
                  {i + 1}
                </span>
                <span className="text-gray-700 pt-0.5">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Best Neighborhoods — clickable, with listings */}
        <div>
          <h3 className="font-bold text-gray-900 mb-1">
            🏘️ Best Neighborhoods for Your Vibe
          </h3>
          <p className="text-xs text-gray-400 mb-3">Tap a neighborhood to see available properties</p>
          <div className="grid gap-2.5">
            {insight.bestNeighborhoods.map((n, i) => {
              const [name, desc] = n.includes(' — ') ? n.split(' — ') : [n, '']
              const isSelected = selectedIdx === i
              const matched = getNeighborhoodListings(name)
              const searchLinks = neighborhoodSearchLinks(name, city, portals)

              return (
                <div key={i}>
                  <button
                    onClick={() => setSelectedIdx(isSelected ? null : i)}
                    className="w-full text-left flex gap-3 rounded-2xl p-3.5 border transition-all"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(to right, #FEF3C7, #FDE68A)'
                        : 'linear-gradient(to right, #FFF5ED, #FFF0E0)',
                      borderColor: isSelected ? '#F59E0B' : '#F4C08A',
                    }}
                  >
                    <div className="text-xl flex-shrink-0 mt-0.5">{medals[i] || '🏡'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{name}</div>
                      {desc && <div className="text-xs text-gray-600 mt-0.5">{desc}</div>}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400 self-center">
                      {isSelected ? '▲' : '▼'}
                    </div>
                  </button>

                  {isSelected && (
                    <div className="mt-2 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                      {matched.length > 0 ? (
                        <>
                          <p className="text-xs text-gray-500 mb-3 font-medium">{matched.length} propert{matched.length === 1 ? 'y' : 'ies'} found in {name}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {matched.slice(0, 4).map(listing => (
                              <ListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 mb-3">No direct listings found for {name} — search on local portals:</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {searchLinks.map(link => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${link.color}`}
                          >
                            <Search className="w-3 h-3" />
                            {link.label}
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Food + Weather mini notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', border: '1px solid #FDBA74' }}>
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">Bao Says Must Try</span>
            </div>
            <p className="text-xs text-orange-900 leading-relaxed">{insight.localFood}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: '1px solid #93C5FD' }}>
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Weather Note</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">{insight.weatherNote}</p>
          </div>
        </div>

        {/* Local portals */}
        {portals.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>🏦</span> Verified Local Property Portals
            </h3>
            <p className="text-xs text-gray-500 mb-3">Trusted sites locals use — often have listings not found elsewhere.</p>
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
        )}

        <div className="border-t border-amber-100 pt-4 flex items-start gap-2">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-xs text-gray-400 leading-relaxed">
            BaoScout is a search assistant only — always verify details with a licensed real estate agent before making any property decisions.
            <span className="font-medium" style={{ color: '#C8281A' }}> Bao apologizes in advance</span> — she cannot be held responsible for you falling in love with a penthouse above your budget! 😂
          </p>
        </div>
      </div>
    </div>
  )
}
