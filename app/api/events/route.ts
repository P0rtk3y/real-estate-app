import { NextRequest, NextResponse } from 'next/server'
import { fetchEvents } from '@/lib/api/events'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  try {
    const events = await fetchEvents(city)
    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
