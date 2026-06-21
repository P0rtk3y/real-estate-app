import { NextRequest, NextResponse } from 'next/server'
import { fetchInsights } from '@/lib/api/insights'
import { DEFAULT_PREFERENCES } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const city = searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  const prefsParam = searchParams.get('preferences')
  const prefs = prefsParam ? { ...DEFAULT_PREFERENCES, ...JSON.parse(prefsParam) } : DEFAULT_PREFERENCES

  try {
    const insights = await fetchInsights(city, prefs)
    return NextResponse.json(insights)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
