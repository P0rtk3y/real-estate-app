'use client'
import { useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { usePreferences } from '@/store/usePreferences'

export default function AddAlertButton({ city }: { city: string }) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const { preferences } = usePreferences()

  async function addAlert() {
    setLoading(true)
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city,
          preferences,
          frequency: 'weekly',
          dayOfWeek: 2,
          timeOfDay: 'morning',
          notificationMethod: 'inapp',
        }),
      })
      setAdded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={addAlert}
      disabled={added || loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
        added
          ? 'bg-emerald-500 text-white cursor-default'
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
      }`}
    >
      {added ? (
        <>
          <BellRing className="w-4 h-4" />
          🥖 Bao will watch this city!
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          {loading ? 'Bao is setting...' : 'Ask Bao to Watch This City 🥖'}
        </>
      )}
    </button>
  )
}
