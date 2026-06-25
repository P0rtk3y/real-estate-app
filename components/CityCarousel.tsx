'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    city: 'Da Nang', country: 'Vietnam', slug: 'da-nang', emoji: '🌊',
    photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80',
    tagline: 'Beach & mountain city',
    price: 'from $48k',
  },
  {
    city: 'Batumi', country: 'Georgia', slug: 'batumi', emoji: '⛰️',
    photo: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1400&q=80',
    tagline: 'Black Sea · no ownership restrictions',
    price: 'from $65k',
  },
  {
    city: 'Kotor', country: 'Montenegro', slug: 'kotor', emoji: '⛵',
    photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=80',
    tagline: 'UNESCO bay · Venetian old town',
    price: 'from €142k',
  },
  {
    city: 'Porto', country: 'Portugal', slug: 'porto', emoji: '🛵',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    tagline: 'Douro River · Atlantic coast',
    price: 'from €175k',
  },
  {
    city: 'Naples', country: 'Italy', slug: 'naples', emoji: '🌋',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80',
    tagline: 'Vesuvius views · UNESCO centro storico',
    price: 'from €195k',
  },
  {
    city: 'Antalya', country: 'Turkey', slug: 'antalya', emoji: '🐚',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
    tagline: 'Mediterranean · 300 sunny days',
    price: 'from $145k',
  },
  {
    city: 'Helsinki', country: 'Finland', slug: 'helsinki', emoji: '❄️',
    photo: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1400&q=80',
    tagline: 'Baltic Sea · design capital',
    price: 'from €310k',
  },
  {
    city: 'Split', country: 'Croatia', slug: 'split', emoji: '🏖️',
    photo: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&q=80',
    tagline: "Diocletian's Palace · Adriatic Sea",
    price: 'from €195k',
  },
]

export default function CityCarousel() {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)
  const router = useRouter()

  const goTo = useCallback((index: number) => {
    setVisible(false)
    setTimeout(() => {
      setActive((index + SLIDES.length) % SLIDES.length)
      setVisible(true)
    }, 400)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => goTo(active + 1), 5000)
    return () => clearInterval(timer)
  }, [active, goTo])

  const slide = SLIDES[active]

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ height: '380px' }}>
      {/* Background image with fade */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
        style={{
          backgroundImage: `url(${slide.photo})`,
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.05) 100%)' }} />

      {/* Content */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{slide.emoji}</span>
              <span className="text-white/80 text-sm font-medium">{slide.country}</span>
            </div>
            <h3 className="text-3xl font-black text-white leading-tight">{slide.city}</h3>
            <p className="text-white/80 text-sm mt-0.5">{slide.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-amber-300 font-black text-lg">{slide.price}</div>
            <button
              onClick={() => router.push(`/scout/${slide.slug}`)}
              className="mt-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold rounded-xl border border-white/30 transition-all active:scale-95"
            >
              Scout it →
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 mt-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                background: i === active ? '#FFD700' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Left / Right arrows */}
      <button
        onClick={() => goTo(active - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => goTo(active + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
