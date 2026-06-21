import { WeatherData } from '@/lib/types'

const OWM_KEY = process.env.OPENWEATHER_API_KEY || ''

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙',
  '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️',
  '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️',
  '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
}

function toF(c: number) { return Math.round(c * 9/5 + 32) }

export async function fetchWeather(city: string): Promise<WeatherData> {
  if (!OWM_KEY) return getDemoWeather(city)

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric`, { next: { revalidate: 1800 } }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OWM_KEY}&units=metric&cnt=40`, { next: { revalidate: 1800 } }),
    ])

    if (!currentRes.ok) throw new Error(`Weather error: ${currentRes.status}`)
    const current = await currentRes.json()
    const forecast = forecastRes.ok ? await forecastRes.json() : null

    const dailyForecast = buildDailyForecast(forecast?.list || [])

    return {
      city: current.name,
      temp_c: Math.round(current.main.temp),
      temp_f: toF(current.main.temp),
      feels_like_c: Math.round(current.main.feels_like),
      feels_like_f: toF(current.main.feels_like),
      description: current.weather[0].description,
      icon: WEATHER_ICONS[current.weather[0].icon] || '🌡️',
      humidity: current.main.humidity,
      wind_kph: Math.round(current.wind.speed * 3.6),
      uv_index: 0,
      forecast: dailyForecast,
    }
  } catch (err) {
    console.error('Weather fetch failed:', err)
    return getDemoWeather(city)
  }
}

function buildDailyForecast(list: OWMForecastItem[]): WeatherData['forecast'] {
  const byDay: Record<string, OWMForecastItem[]> = {}
  list.forEach(item => {
    const day = item.dt_txt.split(' ')[0]
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(item)
  })

  return Object.entries(byDay).slice(0, 5).map(([date, items]) => {
    const temps = items.map(i => i.main.temp)
    const noon = items.find(i => i.dt_txt.includes('12:00')) || items[Math.floor(items.length / 2)]
    return {
      date,
      high_c: Math.round(Math.max(...temps)),
      high_f: toF(Math.max(...temps)),
      low_c: Math.round(Math.min(...temps)),
      low_f: toF(Math.min(...temps)),
      description: noon.weather[0].description,
      icon: WEATHER_ICONS[noon.weather[0].icon] || '🌡️',
    }
  })
}

interface OWMForecastItem {
  dt_txt: string
  main: { temp: number }
  weather: Array<{ description: string; icon: string }>
}

function getDemoWeather(city: string): WeatherData {
  const demos: Record<string, WeatherData> = {
    miami: {
      city: 'Miami', temp_c: 29, temp_f: 84, feels_like_c: 33, feels_like_f: 91,
      description: 'partly cloudy', icon: '⛅', humidity: 78, wind_kph: 15, uv_index: 9,
      forecast: [
        { date: 'Mon', high_c: 31, high_f: 88, low_c: 25, low_f: 77, description: 'sunny', icon: '☀️' },
        { date: 'Tue', high_c: 29, high_f: 84, low_c: 24, low_f: 75, description: 'partly cloudy', icon: '⛅' },
        { date: 'Wed', high_c: 28, high_f: 82, low_c: 24, low_f: 75, description: 'scattered showers', icon: '🌦️' },
        { date: 'Thu', high_c: 30, high_f: 86, low_c: 25, low_f: 77, description: 'sunny', icon: '☀️' },
        { date: 'Fri', high_c: 32, high_f: 90, low_c: 26, low_f: 79, description: 'hot & sunny', icon: '☀️' },
      ],
    },
    tokyo: {
      city: 'Tokyo', temp_c: 18, temp_f: 64, feels_like_c: 17, feels_like_f: 63,
      description: 'clear sky', icon: '☀️', humidity: 55, wind_kph: 8, uv_index: 5,
      forecast: [
        { date: 'Mon', high_c: 20, high_f: 68, low_c: 14, low_f: 57, description: 'clear', icon: '☀️' },
        { date: 'Tue', high_c: 18, high_f: 64, low_c: 13, low_f: 55, description: 'cloudy', icon: '☁️' },
        { date: 'Wed', high_c: 16, high_f: 61, low_c: 12, low_f: 54, description: 'light rain', icon: '🌧️' },
        { date: 'Thu', high_c: 19, high_f: 66, low_c: 14, low_f: 57, description: 'partly cloudy', icon: '⛅' },
        { date: 'Fri', high_c: 22, high_f: 72, low_c: 15, low_f: 59, description: 'sunny', icon: '☀️' },
      ],
    },
    barcelona: {
      city: 'Barcelona', temp_c: 22, temp_f: 72, feels_like_c: 21, feels_like_f: 70,
      description: 'sunny', icon: '☀️', humidity: 62, wind_kph: 12, uv_index: 7,
      forecast: [
        { date: 'Mon', high_c: 24, high_f: 75, low_c: 17, low_f: 63, description: 'sunny', icon: '☀️' },
        { date: 'Tue', high_c: 23, high_f: 73, low_c: 16, low_f: 61, description: 'sunny', icon: '☀️' },
        { date: 'Wed', high_c: 21, high_f: 70, low_c: 15, low_f: 59, description: 'partly cloudy', icon: '⛅' },
        { date: 'Thu', high_c: 22, high_f: 72, low_c: 16, low_f: 61, description: 'clear', icon: '☀️' },
        { date: 'Fri', high_c: 25, high_f: 77, low_c: 18, low_f: 64, description: 'hot & sunny', icon: '☀️' },
      ],
    },
  }

  return demos[city.toLowerCase()] || {
    city,
    temp_c: 20, temp_f: 68, feels_like_c: 19, feels_like_f: 66,
    description: 'partly cloudy', icon: '⛅', humidity: 60, wind_kph: 10, uv_index: 5,
    forecast: [
      { date: 'Mon', high_c: 22, high_f: 72, low_c: 15, low_f: 59, description: 'sunny', icon: '☀️' },
      { date: 'Tue', high_c: 21, high_f: 70, low_c: 14, low_f: 57, description: 'partly cloudy', icon: '⛅' },
      { date: 'Wed', high_c: 19, high_f: 66, low_c: 13, low_f: 55, description: 'cloudy', icon: '☁️' },
      { date: 'Thu', high_c: 20, high_f: 68, low_c: 14, low_f: 57, description: 'clear', icon: '☀️' },
      { date: 'Fri', high_c: 23, high_f: 73, low_c: 15, low_f: 59, description: 'sunny', icon: '☀️' },
    ],
  }
}
