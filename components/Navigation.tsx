'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Settings, Search } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Scout', icon: Search },
    { href: '/preferences', label: 'Prefs', icon: Settings },
    { href: '/alerts', label: 'Alerts', icon: Bell },
  ]

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden sm:block sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/images/lan.png"
                alt="Lan"
                className="h-10 w-10 object-cover object-left-top rounded-xl"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <span className="font-display text-xl" style={{ color: '#C8281A' }}>Lan</span>
              <span className="font-display text-xl" style={{ color: '#8B4513' }}>Scout</span>
            </Link>

            <div className="flex items-center gap-1">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === href
                      ? 'bg-amber-50 text-red-700'
                      : 'text-gray-600 hover:text-red-700 hover:bg-amber-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="sm:hidden sticky top-0 z-50 bg-white border-b border-amber-100 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-center h-12">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-display text-xl" style={{ color: '#C8281A' }}>Lan</span>
            <span className="font-display text-xl" style={{ color: '#8B4513' }}>Scout</span>
            <span className="text-lg">🥖</span>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-amber-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
              >
                <Icon className={`w-6 h-6 ${active ? '' : 'text-gray-400'}`} style={active ? { color: '#C8281A' } : {}} />
                <span className={`text-xs font-semibold ${active ? '' : 'text-gray-400'}`} style={active ? { color: '#C8281A' } : {}}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
