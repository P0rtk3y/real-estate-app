import { NextRequest, NextResponse } from 'next/server'
import { getAlerts, createAlert, updateAlert, deleteAlert } from '@/lib/db'

export async function GET() {
  try {
    const alerts = getAlerts()
    return NextResponse.json({ alerts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { city, country, preferences, frequency, dayOfWeek, dayOfMonth, timeOfDay, notificationMethod } = body

    if (!city || !frequency) {
      return NextResponse.json({ error: 'city and frequency are required' }, { status: 400 })
    }

    const alert = createAlert({
      city,
      country,
      preferences: JSON.stringify(preferences || {}),
      frequency,
      day_of_week: dayOfWeek,
      day_of_month: dayOfMonth,
      time_of_day: timeOfDay || 'morning',
      notification_method: notificationMethod || 'inapp',
      is_active: 1,
      last_scouted: undefined,
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const mapped: Record<string, unknown> = {}
    if ('city' in updates) mapped.city = updates.city
    if ('country' in updates) mapped.country = updates.country
    if ('preferences' in updates) mapped.preferences = JSON.stringify(updates.preferences)
    if ('frequency' in updates) mapped.frequency = updates.frequency
    if ('dayOfWeek' in updates) mapped.day_of_week = updates.dayOfWeek
    if ('dayOfMonth' in updates) mapped.day_of_month = updates.dayOfMonth
    if ('timeOfDay' in updates) mapped.time_of_day = updates.timeOfDay
    if ('notificationMethod' in updates) mapped.notification_method = updates.notificationMethod
    if ('isActive' in updates) mapped.is_active = updates.isActive ? 1 : 0
    if ('lastScouted' in updates) mapped.last_scouted = updates.lastScouted

    const alert = updateAlert(Number(id), mapped as Parameters<typeof updateAlert>[1])
    return NextResponse.json({ alert })
  } catch {
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  try {
    deleteAlert(Number(id))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
