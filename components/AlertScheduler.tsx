'use client'
import { useState } from 'react'
import { Bell, Trash2, Pause, Play, ExternalLink } from 'lucide-react'
import { Alert } from '@/lib/types'

interface Props {
  alert: Alert
  onUpdate: (id: number, data: Partial<Alert>) => void
  onDelete: (id: number) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIMES = [
  { value: 'morning', label: '7am – Morning' },
  { value: 'midday', label: '12pm – Midday' },
  { value: 'evening', label: '6pm – Evening' },
]

export default function AlertScheduler({ alert, onUpdate, onDelete }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const city = alert.city.charAt(0).toUpperCase() + alert.city.slice(1)
  const scoutUrl = `/scout/${alert.city.toLowerCase().replace(/ /g, '-')}`

  function formatSchedule() {
    if (alert.frequency === 'daily') return 'Daily'
    if (alert.frequency === 'weekly') return `Weekly on ${DAYS[alert.dayOfWeek ?? 1]}s`
    if (alert.frequency === 'monthly') return `Monthly on the ${alert.dayOfMonth ?? 1}${ordinal(alert.dayOfMonth ?? 1)}`
    return alert.frequency
  }

  function ordinal(n: number) {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const timeLabel = TIMES.find(t => t.value === alert.timeOfDay)?.label || alert.timeOfDay

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${alert.isActive ? 'border-gray-100' : 'border-gray-100 opacity-70'}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.isActive ? 'bg-red-100' : 'bg-gray-100'}`}>
              <Bell className={`w-5 h-5 ${alert.isActive ? 'text-red-700' : 'text-gray-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{city}</h3>
                {!alert.isActive && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Paused</span>
                )}
              </div>
              <div className="text-sm text-gray-500">{formatSchedule()} • {timeLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={scoutUrl}
              className="p-2 text-red-700 hover:bg-amber-50 rounded-lg transition-colors"
              title="View scout report"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => onUpdate(alert.id, { isActive: !alert.isActive })}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
              title={alert.isActive ? 'Pause' : 'Resume'}
            >
              {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-medium"
            >
              {isExpanded ? 'Hide' : 'Edit'}
            </button>
            <button
              onClick={() => onDelete(alert.id)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {alert.lastScouted && (
          <div className="mt-2 text-xs text-gray-400">
            Last scouted: {new Date(alert.lastScouted).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* Expanded editor */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => onUpdate(alert.id, { frequency: f })}
                  className={`flex-1 py-2 text-xs rounded-xl border capitalize transition-all ${
                    alert.frequency === f
                      ? 'bg-red-700 text-white border-red-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Day of week (if weekly) */}
          {alert.frequency === 'weekly' && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Day of Week</label>
              <div className="flex gap-1">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => onUpdate(alert.id, { dayOfWeek: i })}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                      alert.dayOfWeek === i
                        ? 'bg-red-700 text-white border-red-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-amber-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day of month (if monthly) */}
          {alert.frequency === 'monthly' && (
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Day of Month</label>
              <select
                value={alert.dayOfMonth ?? 1}
                onChange={e => onUpdate(alert.id, { dayOfMonth: Number(e.target.value) })}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-amber-400"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}{ordinal(d)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Time of day */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Time of Day</label>
            <div className="flex gap-2">
              {TIMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onUpdate(alert.id, { timeOfDay: t.value as Alert['timeOfDay'] })}
                  className={`flex-1 py-2 text-xs rounded-xl border transition-all ${
                    alert.timeOfDay === t.value
                      ? 'bg-red-700 text-white border-red-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification method */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Notification</label>
            <div className="flex gap-2">
              {(['inapp', 'email', 'both'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => onUpdate(alert.id, { notificationMethod: m })}
                  className={`flex-1 py-2 text-xs rounded-xl border capitalize transition-all ${
                    alert.notificationMethod === m
                      ? 'bg-red-700 text-white border-red-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {m === 'inapp' ? 'In-App' : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
