'use client'
import { useEffect, useState } from 'react'
import { Bell, Plus, Map } from 'lucide-react'
import { Alert } from '@/lib/types'
import AlertScheduler from '@/components/AlertScheduler'
import Link from 'next/link'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCity, setNewCity] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts')
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts)
      }
    } finally {
      setLoading(false)
    }
  }

  async function addAlert(city: string) {
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city,
        frequency: 'weekly',
        dayOfWeek: 2,
        timeOfDay: 'morning',
        notificationMethod: 'inapp',
        preferences: {},
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setAlerts(prev => [data.alert, ...prev])
      setNewCity('')
      setShowAddForm(false)
    }
  }

  async function updateAlert(id: number, updates: Partial<Alert>) {
    const res = await fetch('/api/alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    if (res.ok) {
      const data = await res.json()
      setAlerts(prev => prev.map(a => a.id === id ? data.alert : a))
    }
  }

  async function deleteAlert(id: number) {
    await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const activeAlerts = alerts.filter(a => a.isActive)
  const pausedAlerts = alerts.filter(a => !a.isActive)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌸 Lan&apos;s Watch List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeAlerts.length > 0 ? `${activeAlerts.length} active — Lan is watching these cities like a hawk! 🦅` : 'Tell Lan which cities to keep her eye on 🔍'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add City
        </button>
      </div>

      {/* Add city form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-teal-200 p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Add a New City Alert</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCity}
              onChange={e => setNewCity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newCity.trim() && addAlert(newCity.trim())}
              placeholder="e.g. Tokyo, Barcelona, Miami..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              autoFocus
            />
            <button
              onClick={() => newCity.trim() && addAlert(newCity.trim())}
              disabled={!newCity.trim()}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">You can customize the schedule after adding the city</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && alerts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có thành phố nào!</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            &quot;Tell Lan which cities to watch and she will check in on your schedule — like a very enthusiastic cô ấy who really wants you to find a beautiful home!&quot;
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Bell className="w-4 h-4" />
              Add your first city
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
            >
              <Map className="w-4 h-4" />
              Explore cities
            </Link>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {!loading && activeAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Alerts</h2>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <AlertScheduler
                key={alert.id}
                alert={alert}
                onUpdate={updateAlert}
                onDelete={deleteAlert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paused alerts */}
      {!loading && pausedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Paused</h2>
          <div className="space-y-3">
            {pausedAlerts.map(alert => (
              <AlertScheduler
                key={alert.id}
                alert={alert}
                onUpdate={updateAlert}
                onDelete={deleteAlert}
              />
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      {!loading && alerts.length > 0 && (
        <div className="mt-10 bg-teal-50 rounded-2xl p-5 border border-teal-100">
          <h3 className="font-semibold text-teal-900 mb-2">How Alerts Work</h3>
          <ul className="text-sm text-teal-800 space-y-1.5">
            <li>→ Your scout checks new listings in each city on your schedule</li>
            <li>→ Listings are scored against your saved preferences</li>
            <li>→ High-match listings (80%+ Scout Score) appear in your in-app notifications</li>
            <li>→ All listings link directly to Realtor.com for verification</li>
          </ul>
        </div>
      )}
    </div>
  )
}
