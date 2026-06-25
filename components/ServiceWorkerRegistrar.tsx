'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          // Check for updates every 60 seconds when app is open
          setInterval(() => reg.update(), 60_000)
        })
        .catch((err) => console.warn('SW registration failed:', err))
    }
  }, [])

  return null
}
