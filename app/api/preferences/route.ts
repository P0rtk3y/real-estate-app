import { NextRequest, NextResponse } from 'next/server'
import { getPreferences, savePreferences } from '@/lib/db'
import { DEFAULT_PREFERENCES } from '@/lib/types'

export async function GET() {
  try {
    const prefs = getPreferences()
    return NextResponse.json({ preferences: prefs || DEFAULT_PREFERENCES })
  } catch {
    return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    savePreferences(body)
    return NextResponse.json({ success: true, preferences: body })
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
