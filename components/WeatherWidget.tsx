'use client'
import { useState } from 'react'
import { Wind, Droplets } from 'lucide-react'
import { WeatherData } from '@/lib/types'

export default function WeatherWidget({ weather }: { weather: WeatherData }) {
  const [unit, setUnit] = useState<'C' | 'F'>('F')

  const temp = unit === 'C' ? weather.temp_c : weather.temp_f
  const feelsLike = unit === 'C' ? weather.feels_like_c : weather.feels_like_f

  return (
    <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white/90">Weather in {weather.city}</h3>
        <button
          onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
          className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition-colors font-medium"
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </div>

      {/* Current */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{weather.icon}</div>
        <div>
          <div className="text-4xl font-bold">{temp}°{unit}</div>
          <div className="text-white/80 capitalize text-sm">{weather.description}</div>
          <div className="text-white/70 text-xs">Feels like {feelsLike}°{unit}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-1.5 text-sm text-white/80">
          <Droplets className="w-4 h-4" />
          {weather.humidity}%
        </div>
        <div className="flex items-center gap-1.5 text-sm text-white/80">
          <Wind className="w-4 h-4" />
          {weather.wind_kph} km/h
        </div>
        {weather.uv_index > 0 && (
          <div className="text-sm text-white/80">
            ☀️ UV {weather.uv_index}
          </div>
        )}
      </div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-5 gap-1">
        {weather.forecast.map((day, i) => {
          const hi = unit === 'C' ? day.high_c : day.high_f
          const lo = unit === 'C' ? day.low_c : day.low_f
          const label = i === 0 ? 'Today' : new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })
          return (
            <div key={i} className="text-center bg-white/10 rounded-xl p-2">
              <div className="text-xs text-white/70 mb-1">{label}</div>
              <div className="text-lg mb-1">{day.icon}</div>
              <div className="text-xs font-semibold">{hi}°</div>
              <div className="text-xs text-white/60">{lo}°</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
