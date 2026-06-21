import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), '.data')
const DB_PATH = path.join(DB_DIR, 'scout.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (db) return db

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  initSchema(db)
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      country TEXT,
      preferences TEXT NOT NULL DEFAULT '{}',
      frequency TEXT NOT NULL DEFAULT 'weekly',
      day_of_week INTEGER,
      day_of_month INTEGER,
      time_of_day TEXT NOT NULL DEFAULT 'morning',
      notification_method TEXT NOT NULL DEFAULT 'inapp',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_scouted TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id TEXT NOT NULL UNIQUE,
      city TEXT,
      data TEXT NOT NULL,
      saved_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export function getPreferences() {
  const db = getDb()
  const row = db.prepare('SELECT data FROM preferences WHERE id = 1').get() as { data: string } | undefined
  return row ? JSON.parse(row.data) : null
}

export function savePreferences(data: object) {
  const db = getDb()
  db.prepare(`
    INSERT INTO preferences (id, data, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
  `).run(JSON.stringify(data))
}

export function getAlerts() {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC').all() as AlertRow[]
  return rows.map(parseAlert)
}

export function getAlert(id: number) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id) as AlertRow | undefined
  return row ? parseAlert(row) : null
}

export function createAlert(data: Omit<AlertRow, 'id' | 'created_at'>) {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO alerts (city, country, preferences, frequency, day_of_week, day_of_month, time_of_day, notification_method, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.city, data.country, data.preferences, data.frequency,
    data.day_of_week, data.day_of_month, data.time_of_day,
    data.notification_method, data.is_active
  )
  return getAlert(result.lastInsertRowid as number)
}

export function updateAlert(id: number, data: Partial<AlertRow>) {
  const db = getDb()
  const allowed = ['city', 'country', 'preferences', 'frequency', 'day_of_week', 'day_of_month',
    'time_of_day', 'notification_method', 'is_active', 'last_scouted']
  const entries = Object.entries(data).filter(([k]) => allowed.includes(k))
  if (!entries.length) return getAlert(id)
  const set = entries.map(([k]) => `${k} = ?`).join(', ')
  db.prepare(`UPDATE alerts SET ${set} WHERE id = ?`).run(...entries.map(([, v]) => v), id)
  return getAlert(id)
}

export function deleteAlert(id: number) {
  const db = getDb()
  db.prepare('DELETE FROM alerts WHERE id = ?').run(id)
}

export function getSavedListings() {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM saved_listings ORDER BY saved_at DESC').all() as { data: string }[]
  return rows.map(r => JSON.parse(r.data))
}

export function saveListing(listingId: string, city: string, data: object) {
  const db = getDb()
  db.prepare(`
    INSERT INTO saved_listings (listing_id, city, data) VALUES (?, ?, ?)
    ON CONFLICT(listing_id) DO NOTHING
  `).run(listingId, city, JSON.stringify(data))
}

export function unsaveListing(listingId: string) {
  const db = getDb()
  db.prepare('DELETE FROM saved_listings WHERE listing_id = ?').run(listingId)
}

interface AlertRow {
  id: number
  city: string
  country?: string
  preferences: string
  frequency: string
  day_of_week?: number
  day_of_month?: number
  time_of_day: string
  notification_method: string
  is_active: number
  last_scouted?: string
  created_at: string
}

function parseAlert(row: AlertRow) {
  return {
    id: row.id,
    city: row.city,
    country: row.country,
    preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences,
    frequency: row.frequency,
    dayOfWeek: row.day_of_week,
    dayOfMonth: row.day_of_month,
    timeOfDay: row.time_of_day,
    notificationMethod: row.notification_method,
    isActive: Boolean(row.is_active),
    lastScouted: row.last_scouted,
    createdAt: row.created_at,
  }
}
