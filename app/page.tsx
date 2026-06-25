import CitySearch, { PopularCities } from '@/components/CitySearch'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <div className="relative text-white py-20 px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #B5179E 0%, #7209B7 30%, #3A0CA3 60%, #0D9488 100%)' }}>
        {/* Decorative lotus shapes */}
        <div className="absolute top-8 left-8 text-8xl opacity-10 select-none rotate-12">🌸</div>
        <div className="absolute bottom-8 right-12 text-9xl opacity-10 select-none -rotate-12">🌺</div>
        <div className="absolute top-1/2 -right-8 text-7xl opacity-10 select-none rotate-45">🎋</div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Lan character */}
          <div className="mb-6 relative inline-block">
            <div className="text-8xl" style={{ filter: 'drop-shadow(0 4px 20px rgba(255,200,0,0.4))' }}>🥖</div>
            <div className="absolute -top-2 -right-3 text-3xl animate-bounce" style={{ animationDuration: '1.8s' }}>🌸</div>
            <div className="absolute -bottom-1 -left-3 text-2xl animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.4s' }}>✨</div>
          </div>

          {/* Character intro */}
          <div className="mb-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-white/90">
            <span>Xin chào! Tôi là</span>
            <span className="font-bold text-yellow-300">Lan</span>
            <span>🌸 Your Vietnamese Property Scout</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            <span className="text-yellow-300">Ồ trời ơi!</span> I found<br />
            your dream home 🏡
          </h1>

          {/* Speech bubble from Lan */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-3xl rounded-tl-none p-5 text-left">
              <p className="text-white/95 leading-relaxed text-base sm:text-lg">
                <span className="font-bold text-yellow-300">Chào bạn!</span> I grew up in Hội An and trained in Sài Gòn
                — now I scout beautiful homes in{' '}
                <span className="text-yellow-200 font-semibold">every city on Earth 🌍</span>.
                I give you the real cultural flavor, not just the listing. You deserve to know if the neighborhood
                has good{' '}
                <span className="text-yellow-200 italic">phở</span>,
                what the weather is actually like, and what concerts are coming up!
                <span className="font-bold"> Được quá!</span>
              </p>
            </div>
            <div className="absolute top-0 left-0 w-4 h-4 overflow-hidden">
              <div className="bg-white/15 w-8 h-8 rotate-45 -translate-x-4 -translate-y-4" />
            </div>
          </div>

          {/* Search */}
          <div className="flex justify-center mb-4">
            <CitySearch />
          </div>

          <p className="text-white/60 text-sm">Press Enter or click &quot;Scout it&quot; — Lan is ready to go! 🛵</p>
        </div>
      </div>

      {/* Popular cities */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">🌺 Lan&apos;s Favorite Destinations</h2>
          <p className="text-gray-500 text-sm">&quot;I&apos;ve scouted all of these — click to see my full report!&quot;</p>
        </div>
        <div className="flex justify-center">
          <PopularCities />
        </div>
      </div>

      {/* What Lan does */}
      <div className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">What Your Scout Does</h2>
            <p className="text-gray-500 text-sm mt-2">
              &quot;I work harder than a phở chef at 5am, okay?&quot; — Lan 🌸
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: '🏡',
                title: 'Real Listings, Real Sources',
                desc: 'Properties from Realtor.com — always with a direct link back to the source. No fake listings, no scams!',
                lan: '"Má tôi always says: go directly to the source!"',
              },
              {
                emoji: '🎨',
                title: 'Cultural Intelligence',
                desc: 'Lan writes a genuine, witty scout report on each city — neighborhoods, vibes, expat life, and which coffee shop opens earliest.',
                lan: '"I compare every city to somewhere in Việt Nam 😄"',
              },
              {
                emoji: '🌤️',
                title: 'Live Weather',
                desc: 'Current conditions and 5-day forecast from OpenWeatherMap.',
                lan: '"Mưa hay nắng? Rain or shine? You need to know!"',
              },
              {
                emoji: '🎭',
                title: 'Upcoming Events',
                desc: 'Concerts, festivals, and markets from Ticketmaster — see what life in the city actually looks like.',
                lan: '"Festivals are how Lan judges a city\'s soul 💃"',
              },
              {
                emoji: '🍜',
                title: 'Local Food Scene',
                desc: 'Top-rated restaurants via Yelp. Because the food scene IS the neighborhood.',
                lan: '"No good phở nearby? Lan is concerned. Very concerned."',
              },
              {
                emoji: '🔔',
                title: 'Smart Alerts',
                desc: 'Weekly Tuesday alert for Miami, monthly Barcelona check-in — your schedule, your way.',
                lan: '"Lan will remind you! Like a very enthusiastic cô ấy!"',
              },
              {
                emoji: '🎛️',
                title: 'Rich Preferences',
                desc: 'Ocean view, gym, rooftop, natural light, pet-friendly — filter exactly like Zillow but for the whole world.',
                lan: '"Natural light is non-negotiable. This is Lan\'s rule."',
              },
              {
                emoji: '📸',
                title: 'Always Photos',
                desc: 'Every listing comes with photos — Lan refuses to show you a home without seeing it first.',
                lan: '"My bà nội taught me: always look before you leap!"',
              },
              {
                emoji: '🤖',
                title: 'Scout Score',
                desc: 'Each listing gets a match % against your preferences. 95%? Lan has found a gem!',
                lan: '"100% match? Lan is already packing your boxes. 😂"',
              },
            ].map(({ emoji, title, desc, lan }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-rose-200 hover:bg-rose-50/20 transition-colors group">
                <span className="text-3xl flex-shrink-0">{emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-rose-700 transition-colors">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-2">{desc}</p>
                  <p className="text-xs text-rose-500 italic">{lan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-14 px-4 text-center" style={{ background: 'linear-gradient(135deg, #B5179E 0%, #7209B7 50%, #0D9488 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold text-white mb-3">Sẵn sàng chưa? Ready?</h2>
          <p className="text-white/80 mb-6">Tell Lan which city and she&apos;ll do the rest — văn hóa, thời tiết, nhà đẹp!</p>
          <div className="flex justify-center">
            <CitySearch />
          </div>
        </div>
      </div>
    </div>
  )
}
