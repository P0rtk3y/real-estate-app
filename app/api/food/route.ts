import { NextRequest, NextResponse } from 'next/server'
import { fetchFood } from '@/lib/api/food'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  try {
    const restaurants = await fetchFood(city)
    return NextResponse.json({ restaurants })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 })
  }
}
