import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather } from '@/lib/api/weather'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  try {
    const weather = await fetchWeather(city)
    return NextResponse.json(weather)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
