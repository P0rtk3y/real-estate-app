import CitySearch, { PopularCities } from '@/components/CitySearch'
import LanCharacter from '@/components/LanCharacter'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #C8281A 0%, #9B3012 45%, #5C1F0A 100%)' }}
      >
        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col items-center pt-6 pb-8 px-5">
          <LanCharacter className="w-64 h-64 object-contain drop-shadow-2xl" fallbackSize="text-8xl" />

          <h1 className="text-3xl font-black text-center leading-tight mb-2">
            Find your<br />
            <span style={{ color: '#FFD700' }}>dream home</span>, anywhere 🏡
          </h1>
          <p className="text-white/80 text-sm text-center mb-5 max-w-xs leading-relaxed">
            Lan scouts cities worldwide — culture, weather, food, events, and the best neighborhoods. All in one place.
          </p>
          <div className="w-full max-w-sm">
            <CitySearch />
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex items-center gap-8 max-w-5xl mx-auto px-6 py-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-white/90 mb-4">
              <span>Hi, I&apos;m</span>
              <span className="font-display text-base" style={{ color: '#FFD700' }}>Lan</span>
              <span>🥖 Your Vietnamese Property Scout</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black mb-4 leading-tight">
              Find your<br />
              <span style={{ color: '#FFD700' }}>dream home</span>,<br />
              anywhere 🏡
            </h1>

            <p className="text-white/80 text-lg mb-7 max-w-lg leading-relaxed">
              Lan scouts cities worldwide — cultural insights, live weather, upcoming events,
              food hotspots, and the best neighborhoods. All in one place.
            </p>

            <CitySearch />
          </div>

          <div className="flex-shrink-0 w-80">
            <LanCharacter className="w-full drop-shadow-2xl" />
          </div>
        </div>
      </div>

      {/* ── Popular cities ───────────────────────────────────── */}
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <h2 className="text-base font-black text-gray-900 mb-3 text-center">🥖 Lan&apos;s Favorite Cities</h2>
        <PopularCities />
      </div>

      {/* ── What Lan does ────────────────────────────────────── */}
      <div className="border-t py-10 sm:py-14" style={{ background: '#FFF9F0', borderColor: '#F5E6D3' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-gray-900">What Lan Does For You</h2>
            <p className="text-gray-500 text-sm mt-1">&quot;I work harder than a phở chef at 5am!&quot; — Lan 🥖</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: '🏡', title: 'Real Listings', desc: 'Live properties from Realtor.com — no fake listings, no scams.' },
              { emoji: '🎨', title: 'Cultural Insights', desc: 'Lan\'s real take on neighborhoods, vibes, and expat life.' },
              { emoji: '🌤️', title: 'Live Weather', desc: 'Current conditions and 5-day forecast so you\'re never surprised.' },
              { emoji: '🎭', title: 'Upcoming Events', desc: 'Concerts, festivals & markets from Ticketmaster.' },
              { emoji: '🍜', title: 'Food Scene', desc: 'Top-rated restaurants via Yelp. The food IS the neighborhood.' },
              { emoji: '🔔', title: 'Smart Alerts', desc: 'Weekly or monthly check-ins on the cities you\'re watching.' },
              { emoji: '🎛️', title: 'Your Preferences', desc: 'Ocean view, gym, rooftop, natural light — filter like Zillow, globally.' },
              { emoji: '📸', title: 'Always Photos', desc: 'Every listing has photos. Lan refuses to show a home blind.' },
              { emoji: '🤖', title: 'Scout Score', desc: 'Each listing gets a % match against your preferences.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all group">
                <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-0.5 group-hover:text-red-700 transition-colors">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="py-12 px-4 text-center hidden sm:block" style={{ background: 'linear-gradient(135deg, #C8281A 0%, #9B3012 50%, #3D7A4A 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-3">🥖</div>
          <h2 className="text-2xl font-black text-white mb-3">Ready to Scout?</h2>
          <p className="text-white/75 mb-5 text-sm">Pick a city and Lan will do the rest.</p>
          <CitySearch />
        </div>
      </div>
    </div>
  )
}
