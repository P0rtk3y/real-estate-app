'use client'
import { ScoutInsight } from '@/lib/types'
import { MapPin, Lightbulb, Utensils, Cloud } from 'lucide-react'

interface Props {
  city: string
  insight: ScoutInsight
}

export default function ScoutReport({ city, insight }: Props) {
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

        {/* Best Neighborhoods */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            🏘️ Best Neighborhoods for Your Vibe
          </h3>
          <div className="grid gap-2.5">
            {insight.bestNeighborhoods.map((n, i) => {
              const [name, desc] = n.includes(' — ') ? n.split(' — ') : [n, '']
              const medals = ['🥇', '🥈', '🥉', '🌿']
              return (
                <div key={i} className="flex gap-3 rounded-2xl p-3.5 border" style={{ background: 'linear-gradient(to right, #FFF5ED, #FFF0E0)', borderColor: '#F4C08A' }}>
                  <div className="text-xl flex-shrink-0 mt-0.5">{medals[i] || '🏡'}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{name}</div>
                    {desc && <div className="text-xs text-gray-600 mt-0.5">{desc}</div>}
                  </div>
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
