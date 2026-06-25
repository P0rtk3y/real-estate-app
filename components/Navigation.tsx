'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Settings, Home } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Scout', icon: Home },
    { href: '/preferences', label: 'Preferences', icon: Settings },
    { href: '/alerts', label: 'Alerts', icon: Bell },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl">
            <span className="text-2xl">🥖</span>
            <span className="font-display" style={{ color: '#C8281A' }}>Lan</span>
            <span className="font-display" style={{ color: '#8B4513' }}>Scout</span>
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
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
