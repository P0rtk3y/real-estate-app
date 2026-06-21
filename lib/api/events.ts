import { Event } from '@/lib/types'

const TM_KEY = process.env.TICKETMASTER_API_KEY || ''

export async function fetchEvents(city: string): Promise<Event[]> {
  if (!TM_KEY) return getDemoEvents(city)

  try {
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
    url.searchParams.set('apikey', TM_KEY)
    url.searchParams.set('city', city)
    url.searchParams.set('size', '8')
    url.searchParams.set('sort', 'date,asc')
    url.searchParams.set('startDateTime', new Date().toISOString().split('.')[0] + 'Z')

    const res = await fetch(url.toString(), { next: { revalidate: 7200 } })
    if (!res.ok) throw new Error(`Ticketmaster error: ${res.status}`)
    const data = await res.json()
    const items = data?._embedded?.events || []

    return items.slice(0, 8).map((e: TicketmasterEvent) => ({
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      venue: e._embedded?.venues?.[0]?.name || 'TBA',
      category: e.classifications?.[0]?.segment?.name || 'Entertainment',
      url: e.url,
      imageUrl: e.images?.find((img: { ratio: string; width: number; url: string }) => img.ratio === '16_9' && img.width > 500)?.url,
      priceRange: e.priceRanges
        ? `$${e.priceRanges[0].min}–$${e.priceRanges[0].max}`
        : undefined,
    }))
  } catch (err) {
    console.error('Events fetch failed:', err)
    return getDemoEvents(city)
  }
}

interface TicketmasterEvent {
  id: string
  name: string
  url: string
  dates?: { start?: { localDate?: string; localTime?: string } }
  _embedded?: { venues?: Array<{ name: string }> }
  classifications?: Array<{ segment?: { name: string } }>
  images?: Array<{ ratio: string; width: number; url: string }>
  priceRanges?: Array<{ min: number; max: number }>
}

function getDemoEvents(city: string): Event[] {
  const cityLower = city.toLowerCase()
  const cityEvents: Record<string, Event[]> = {
    miami: [
      { id: 'e1', name: 'Art Basel Miami Beach', date: '2026-12-04', time: '14:00:00', venue: 'Miami Beach Convention Center', category: 'Arts', url: 'https://www.artbasel.com', imageUrl: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=400&q=80', priceRange: '$50–$500' },
      { id: 'e2', name: 'Miami Music Week', date: '2026-03-18', time: '22:00:00', venue: 'Various Venues, South Beach', category: 'Music', url: 'https://www.ultramusicfestival.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '$75–$350' },
      { id: 'e3', name: 'Calle Ocho Festival', date: '2026-03-08', time: '11:00:00', venue: 'Little Havana, SW 8th Street', category: 'Cultural', url: 'https://www.carnavalmiami.com', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
    ],
    tokyo: [
      { id: 'e1', name: 'Sumida River Fireworks Festival', date: '2026-07-25', time: '19:00:00', venue: 'Sumida River, Asakusa', category: 'Festival', url: 'https://www.jnto.go.jp', imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80' },
      { id: 'e2', name: 'Tokyo Jazz Festival', date: '2026-09-05', time: '12:00:00', venue: 'NHK Hall, Shibuya', category: 'Music', url: 'https://www.tokyo-jazz.com', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
      { id: 'e3', name: 'Harajuku Omotesando Super Yosakoi', date: '2026-08-22', time: '10:00:00', venue: 'Omotesando, Harajuku', category: 'Cultural', url: 'https://www.jnto.go.jp', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80' },
    ],
    barcelona: [
      { id: 'e1', name: 'Primavera Sound', date: '2026-05-28', time: '17:00:00', venue: 'Parc del Fòrum', category: 'Music', url: 'https://www.primaverasound.com', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80', priceRange: '€85–€295' },
      { id: 'e2', name: 'La Mercè Festival', date: '2026-09-24', time: '10:00:00', venue: 'Throughout Barcelona', category: 'Cultural', url: 'https://lamerce.barcelona', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
      { id: 'e3', name: 'FC Barcelona vs Real Madrid (El Clásico)', date: '2026-10-19', time: '21:00:00', venue: 'Camp Nou', category: 'Sports', url: 'https://www.fcbarcelona.com', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', priceRange: '€100–$800' },
    ],
    paris: [
      { id: 'e1', name: 'Paris Fashion Week', date: '2026-09-28', time: '10:00:00', venue: 'Various Paris Venues', category: 'Fashion', url: 'https://www.fhcm.paris', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80' },
      { id: 'e2', name: 'Nuit Blanche', date: '2026-10-03', time: '19:00:00', venue: 'Throughout Paris', category: 'Arts', url: 'https://quefaire.paris.fr', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
    ],
    sydney: [
      { id: 'e1', name: 'Sydney Festival', date: '2026-01-08', time: '10:00:00', venue: 'Various Sydney Venues', category: 'Arts', url: 'https://www.sydneyfestival.org.au', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
      { id: 'e2', name: 'Vivid Sydney', date: '2026-05-22', time: '18:00:00', venue: 'Sydney CBD & Harbour', category: 'Festival', url: 'https://www.vividsydney.com', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80' },
    ],
  }

  return cityEvents[cityLower] || [
    { id: 'e1', name: 'International Food & Wine Festival', date: '2026-07-12', time: '12:00:00', venue: 'City Central Park', category: 'Food & Drink', url: '#', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
    { id: 'e2', name: 'Summer Jazz Series', date: '2026-07-18', time: '20:00:00', venue: 'Riverside Amphitheater', category: 'Music', url: '#', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&q=80' },
    { id: 'e3', name: 'Night Market: Artisan Crafts', date: '2026-07-25', time: '17:00:00', venue: 'Historic District', category: 'Market', url: '#', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80' },
  ]
}
