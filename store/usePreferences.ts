'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPreferences, DEFAULT_PREFERENCES } from '@/lib/types'

interface PreferencesStore {
  preferences: UserPreferences
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  setPreferences: (prefs: UserPreferences) => void
  reset: () => void
  saveToServer: () => Promise<void>
  loadFromServer: () => Promise<void>
}

export const usePreferences = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      setPreference: (key, value) =>
        set(state => ({ preferences: { ...state.preferences, [key]: value } })),
      setPreferences: prefs => set({ preferences: prefs }),
      reset: () => set({ preferences: DEFAULT_PREFERENCES }),
      saveToServer: async () => {
        const { preferences } = get()
        await fetch('/api/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences),
        })
      },
      loadFromServer: async () => {
        const res = await fetch('/api/preferences')
        if (res.ok) {
          const data = await res.json()
          set({ preferences: data.preferences })
        }
      },
    }),
    { name: 'scout-preferences' }
  )
)
